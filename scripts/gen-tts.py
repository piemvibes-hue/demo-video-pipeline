#!/usr/bin/env python3
# 配音批量生成 —— 从 constants.ts 的 VO 表（单一文本源）逐场景产出 {scene}.wav/.mp3
# 引擎优先级：
#   1. IndexTTS-2 本地克隆（TTS_HOME 指向 index-tts 仓库，REF 指向参考音色 wav）——效果最好
#   2. edge-tts（pip install edge-tts）——零依赖云端备用，VOICE=zh-CN-XX 选一个音色
# 已有的文件自动跳过，删了重跑即重生；全片用同一个 emo，语气才统一。
import os, re, subprocess, sys

ROOT = os.environ.get("PROJECT", os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/template")
OUT = os.environ.get("AUDIO_OUT", f"{ROOT}/public/audio")
CONSTANTS = os.environ.get("CONSTANTS", f"{ROOT}/src/constants.ts")
os.makedirs(OUT, exist_ok=True)

# ---- VO 解析：constants.ts 是唯一文本源 ----
src = open(CONSTANTS, encoding="utf-8").read()
SCENES = re.findall(r'(\w+):\s*\{\s*text:\s*"([^"]+)",\s*emo:\s*"([^"]+)"', src)
assert SCENES, "VO parse failed: constants.ts 里找不到 name: {text, emo} 结构"
print(f"parsed {len(SCENES)} scenes: {[s[0] for s in SCENES]}")

TTS_HOME = os.environ.get("TTS_HOME")
REF = os.environ.get("REF", "voices/ref.wav")

tts = None
if TTS_HOME:
    sys.path.insert(0, TTS_HOME)
    from indextts.infer_v2 import IndexTTS2  # noqa
    tts = IndexTTS2(cfg_path=os.path.join(TTS_HOME, "checkpoints_2/config.yaml"),
                    model_dir=os.path.join(TTS_HOME, "checkpoints_2"),
                    use_fp16=False, use_cuda_kernel=False, use_deepspeed=False)

for name, text, emo in SCENES:
    wav, mp3 = f"{OUT}/{name}.wav", f"{OUT}/{name}.mp3"
    if os.path.exists(mp3):
        print(f"skip {name}")
        continue
    if tts:
        print(f">>> {name} (IndexTTS-2): {emo}")
        try:
            tts.infer(spk_audio_prompt=REF, text=text, output_path=wav,
                      use_emo_text=True, emo_text=emo, emo_alpha=0.7, verbose=False)
        except TypeError:
            tts.infer(spk_audio_prompt=REF, text=text, output_path=wav, verbose=False)
    else:
        # edge-tts 备用：pip install edge-tts；中文女声路演感可用 zh-CN-XiaoxiaoNeural
        voice = os.environ.get("VOICE", "zh-CN-XiaoxiaoNeural")
        print(f">>> {name} (edge-tts {voice})")
        subprocess.run(["edge-tts", "--voice", voice, "--text", text,
                        "--write-media", wav], check=True)
    subprocess.run(["ffmpeg", "-y", "-i", wav, "-codec:a", "libmp3lame", "-q:a", "3", mp3],
                   check=True, capture_output=True)
    d = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries",
                                 "format=duration", "-of", "csv=p=0", mp3]).strip()
    print(f"    {name}.mp3  {d}s")
print("done")
