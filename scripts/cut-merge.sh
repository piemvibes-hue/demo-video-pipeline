#!/usr/bin/env bash
# 镜头裁剪+合并 —— 把多段 webm/mp4 的子区间拼成一条场景素材
# 用法：./cut-merge.sh out.mp4 "src1.webm:START:END" "src2.webm:START:END" ...
# 点位从 dry-run 时间轴来；每个区间只保留「动作发生」的部分，登录/加载死帧全裁
set -euo pipefail
OUT="$1"; shift
TMP=$(mktemp -d)
LIST="$TMP/list.txt"; : > "$LIST"
i=0
for spec in "$@"; do
  src="${spec%%:*}"; rest="${spec#*:}"
  st="${rest%%:*}"; en="${rest##*:}"
  i=$((i+1))
  ffmpeg -y -v error -ss "$st" -to "$en" -i "$src" \
    -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -vf "fps=30" -an "$TMP/s$i.mp4"
  echo "file 's$i.mp4'" >> "$LIST"
done
ffmpeg -y -v error -f concat -safe 0 -i "$LIST" -c copy "$OUT"
rm -rf "$TMP"
ffprobe -v error -show_entries format=duration -of default=nw=1 "$OUT"
