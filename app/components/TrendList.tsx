// app/components/TrendList.tsx

type Tweet = {
  text: string;
};

type TrendListProps = {
  tweets: Tweet[];
  onTagClick?: (tag: string) => void;
};

export default function TrendList({ tweets, onTagClick }: TrendListProps) {

  const counts: Record<string, number> = {};

  tweets.forEach(t => {
    const tags = t.text.match(/#[^#\s]+/g) || [];

    tags.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  const sortedTrends = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="w-64 shrink-0 h-max sticky top-5">
      <h2 className="text-lg font-bold mb-3 text-zinc-200 border-b border-zinc-800 pb-2">
        今のトレンド
      </h2>

      {sortedTrends.length === 0 ? (
        <p className="text-xs text-zinc-500 leading-relaxed">
          # をつけて投稿すると、ここにトレンドが表示されます
        </p>
      ) : (
        <div className="space-y-4">
          {sortedTrends.map(([tag, count], index) => (
            <div
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className="hover:bg-zinc-800/50 p-2 rounded transition cursor-pointer"
            >
              <span className="text-xs text-zinc-500">
                {index + 1}位 ・ トレンド
              </span>

              <p className="font-bold text-sky-400 text-sm mt-0.5">
                {tag}
              </p>

              <span className="text-[11px] text-zinc-400">
                {count}件の投稿
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
