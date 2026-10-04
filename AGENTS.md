# AGENTS.md — 给所有编程智能体的使用说明

本仓库是一个**可直接被 agent 执行的技能包**，不是给人读的文档集。你的任务是把「一个真实产品的操作」做成一条配音字幕全同步的演示视频。

## 入口

读 `SKILL.md`——它是执行规范，按它的 8 步顺序做。`docs/method.md` 是背景方法与坑位清单，需要决策依据时读。

## 目录即技能

仓库根目录本身就是一个合法 skill 目录（SKILL.md + scripts/ + docs/）。不同工具的装载方式：

| 工具 | 装法 |
|---|---|
| Claude Code | 整目录复制为 `<项目>/.claude/skills/demo-video-pipeline/`，或 `~/.claude/skills/` 全局可用 |
| Codex | 整目录复制为 `<项目>/.codex/skills/demo-video-pipeline/`；或让 AGENTS.md 引导 Codex 按需读 SKILL.md |
| Devin | 整目录复制为 `<项目>/.devin/skills/demo-video-pipeline/` |
| 其他 agent | 直接把 `SKILL.md` 内容作为系统指令/上下文喂给它，脚本按相对路径调用 |

## 执行契约

- 脚本在 `scripts/`：record-clips.cjs（录屏）、cut-merge.sh（剪辑）、gen-tts.py（配音）、sync-timing.py（对齐）
- Remotion 工程骨架在 `template/`：复制到用户项目后按它的 VO/SCENES 结构填
- 环境变量约定：`PROJECT`（工程根）、`AUDIO_OUT`、`TTS_HOME`、`REF`、`BASE`、`OUT`——脚本头部有注释
- 产出验收：渲染后必须抽帧核（无死帧/字幕断句/徽标时机），不要构建完就交付

## 不要做

- 不要手工逐字切分字幕时间戳——用 sync-timing.py 让 whisper 反推
- 不要让画面滞后口播——ClipStage 的 `from` 跳到动作点
- 不要把整段配音稿糊在屏上——SyncedCaption 已做句级断句，别绕开它
