// app/components/TrendList.tsx

// 親から投稿データ（tweets）と、★追加：タグクリック時の関数（onTagClick）を受け取る
export default function TrendList({ tweets, onTagClick }) {

  // ハッシュタグの出現回数を記録するオブジェクト
  const counts = {};

  // 全投稿を1個ずつ走査
  tweets.forEach(t => {
    // 投稿文の中からハッシュタグ（#文字）を正規表現で抽出
    const tags = t.text.match(/#[^#\s]+/g) || [];

    // 見つかったタグのカウントを増やす
    tags.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  // カウントが多い順に並び替え（配列化）
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
          {/* mapでトレンドランキングを自動生成 */}
          {sortedTrends.map(([tag, count], index) => (
            <div
              key={tag}
              // ========================================
              // ★ミッション2：クリック時に親から貰った関数を実行して状態を書き換える
              // ========================================
              onClick={() => onTagClick && onTagClick(tag)}
              className="hover:bg-zinc-800/50 p-2 rounded transition cursor-pointer"
            >
              {/* 順位表示 */}
              <span className="text-xs text-zinc-500">
                {index + 1}位 ・ トレンド
              </span>

              {/* ハッシュタグ表示 */}
              <p className="font-bold text-sky-400 text-sm mt-0.5">
                {tag}
              </p>

              {/* 件数表示 */}
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


