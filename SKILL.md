---
name: demo-video-pipeline
description: 把一个真实产品的操作剪成 2–3 分钟、配音字幕完全同步的演示视频——playwright 录屏→ffmpeg 拼场景→TTS 配音→whisper 词级对齐→Remotion 合成。做产品演示视频、黑客松/路演视频、release demo reel 时使用。
---

# demo-video-pipeline

端到端做一条「真机录屏 + 路演配音 + 逐字同步字幕」演示视频的流水线。脚本在 `scripts/`，Remotion 工程骨架在 `template/`。

## 使用顺序（严格按此，别跳步）

1. **写叙事线**：一场一个评分点/记忆点，串成「一个案子的闭环」而不是功能罗列。先给用户看场景表确认再往下走。
2. **录镜头**：复制 `scripts/record-clips.cjs` 到用户项目，改 `BASE` 与登录路径，每段一个 playwright context `recordVideo`。录制前先 dry-run 拿动作时间轴（每个动作在素材第几秒）。**录到功能 bug 先修再录**——折叠卡片/异步面板先点开再截。
3. **剪素材**：`scripts/cut-merge.sh out.mp4 "a.webm:8:21" "b.webm:6:13"`。每段裁掉开头 5-8s 登录/加载死帧，只留动作。
4. **写配音稿**：改 `template/src/constants.ts` 的 `VO`——口语化（"A I"/"九成一点三"），emo 全片统一，每场 ≤80 字。
5. **生成配音**：`PROJECT=template TTS_HOME=<index-tts路径> REF=<参考音色.wav> python3 scripts/gen-tts.py`；无 IndexTTS-2 用 edge-tts 兜底。
6. **词级对齐**：`PROJECT=template python3 scripts/sync-timing.py`（生成 timing.ts + 重写 SCENES；whisper 识别回配音稿，不要手工切字）。
7. **写场景**：照 `template/src/scenes.tsx` 四件套——SceneTransition + ClipStage(from=动作点) + BadgeRow(said("短语")) + SyncedCaption。**画面必须不滞后口播**：from 跳到动作发生点，口播提到 X 时画面必须已是 X。
8. **渲染抽帧验收**：`npx remotion render` 后必须抽帧核：无登录死帧、无半加载帧、字幕断句生效、徽标时机对。

## 铁律

- VO 稿是唯一文本源——字幕/时长/徽标全由它派生
- 全片镜头必须真实产品录屏（地址栏/流式/toast 是真系统表现）
- 一个功能至少演一个完整交互（点开→操作→状态落地），扫一眼不算演过
- 字幕句级断句；徽标用 `said("短语")` 时机触发
- 评审视角预检：2–3 分钟、无死帧、音画同步、每功能演透

详见 docs/method.md（方法论+坑位清单）。
