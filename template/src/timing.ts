// 由 scripts/sync-timing.py 生成——Whisper 词级时间戳逐字对齐到配音稿。
// 占位内容让工程能直接起 Studio 预览（无字幕状态）；配音生成后重跑 sync 即填真值。
export const AUDIO_TIMING: Record<
  string,
  { duration: number; words: Array<{ text: string; start: number; end: number }> }
> = {};
