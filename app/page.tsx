"use client";

import React, { useState, useEffect } from "react";
import TrendList from "./components/TrendList";

// ツイート（ポスト）の厳密な型定義
interface Tweet {
  id: string;
  text: string;
  image: string;
  videoUrl: string;
  likes: number;
  reposts: number;
  isReposted: boolean;
  time: string;
}

// 簡易的なVideoPostコンポーネント
function VideoPost({ src }: { src: string }) {
  return (
    <div className="relative rounded-lg overflow-hidden bg-zinc-950 aspect-video">
      <video src={src} controls className="w-full h-full" />
    </div>
  );
}

export default function Page() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [input, setInput] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [video, setVideo] = useState<string>("");
  const [videoUrlInput, setVideoUrlInput] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [searchTag, setSearchTag] = useState<string>("");

  // 初期データのフェッチ
  useEffect(() => {
    fetch("/api/tweets")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setTweets(data))
      .catch((err) => console.error("データ取得に失敗:", err));
  }, []);

  // 🛠️ 【ここを完全に修正】 e の型を完全に明示して any を排除
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const resultStr = reader.result;
        if (file.type.startsWith("video/")) {
          setVideo(resultStr);
          setImage("");
        } else {
          setImage(resultStr);
          setVideo("");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // 🛠️ 【ここも修正】送信イベントの型を明示
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() && !image && !video && !videoUrlInput.trim()) return;

    const finalVideoUrl = videoUrlInput.trim() !== "" ? videoUrlInput.trim() : video;

    const newTweet: Tweet = {
      id: Date.now().toString(),
      text: input,
      image: image,
      videoUrl: finalVideoUrl,
      likes: 0,
      reposts: 0,
      isReposted: false,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setTweets([newTweet, ...tweets]);
    setInput("");
    setImage("");
    setVideo("");
    setVideoUrlInput("");

    try {
      await fetch("/api/tweets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTweet),
      });
    } catch (err) {
      console.error("サーバーへの送信に失敗しました:", err);
    }
  };

  const handleRemove = (id: string) => {
    setTweets(tweets.filter((t) => t.id !== id));
  };

  const handleLike = (id: string) => {
    setTweets(
      tweets.map((t) =>
        t.id === id ? { ...t, likes: (t.likes || 0) + 1 } : t
      )
    );
  };

  const handleRepost = (id: string) => {
    setTweets(
      tweets.map((t) => {
        if (t.id === id) {
          const isReposted = t.isReposted || false;
          return {
            ...t,
            isReposted: !isReposted,
            reposts: (t.reposts || 0) + (isReposted ? -1 : 1),
          };
        }
        return t;
      })
    );
  };

  const displayTweets = tweets.filter((t) => {
    if (searchTag && !t.text.includes(searchTag)) return false;
    if (currentTab === "images" && t.image === "" && !t.videoUrl) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-5">
      <div className="max-w-4xl mx-auto flex gap-6">
        <div className="flex-1 space-y-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            🐱 ニャンスタグラム{" "}
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded ml-2">
              Influencer Ed.
            </span>
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800 space-y-3"
          >
            <textarea
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              placeholder="いまどうしてる？"
              className="w-full bg-transparent text-sm resize-none outline-none text-white h-16"
            />

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 block font-bold">
                ネット上の動画URLから追加
              </label>
              <input
                type="text"
                value={videoUrlInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoUrlInput(e.target.value)}
                placeholder="https://example.com/movie.mp4"
                className="w-full bg-zinc-800 text-xs text-zinc-200 px-3 py-2 rounded-lg border border-zinc-700 outline-none focus:border-pink-500"
              />
            </div>

            {image && (
              <div className="relative w-20 h-20">
                <img
                  src={image}
                  className="w-full h-full object-cover rounded-lg"
                  alt="preview"
                />
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="text-xs text-zinc-500"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2 rounded-full text-sm font-bold"
              >
                シェアする
              </button>
            </div>
          </form>

          <div className="flex gap-4 border-b border-zinc-800 pb-2">
            <button
              onClick={() => {
                setCurrentTab("all");
                setSearchTag("");
              }}
              className={`text-sm ${
                currentTab === "all" && !searchTag
                  ? "text-pink-400 border-b-2 border-pink-400"
                  : "text-zinc-400"
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setCurrentTab("images")}
              className={`text-sm ${
                currentTab === "images"
                  ? "text-pink-400 border-b-2 border-pink-400"
                  : "text-zinc-400"
              }`}
            >
              メディア
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {displayTweets.map((t) => (
              <div
                key={t.id}
                className="border border-zinc-800 p-4 bg-zinc-900/20 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between text-xs text-zinc-500 mb-2">
                    <span className="font-bold">@influencer_guest</span>
                    <button onClick={() => handleRemove(t.id)}>🗑️</button>
                  </div>
                  <p className="text-white text-sm mb-2">{t.text}</p>
                  {t.image && (
                    <img
                      src={t.image}
                      className="rounded-lg mb-2 w-full"
                      alt="uploaded"
                    />
                  )}
                  {t.videoUrl && <VideoPost src={t.videoUrl} />}
                </div>

                <div className="flex justify-between text-zinc-500 text-xs mt-4 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => handleLike(t.id)}
                    className="hover:text-pink-500 transition flex items-center gap-1"
                  >
                    ❤️ {t.likes || 0}
                  </button>
                  <button
                    onClick={() => handleRepost(t.id)}
                    className={`hover:text-green-500 transition flex items-center gap-1 ${
                      t.isReposted ? "text-green-500" : ""
                    }`}
                  >
                    🔁 {t.reposts || 0}
                  </button>
                  <span>{t.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <TrendList tweets={tweets} onTagClick={(tag) => setSearchTag(tag)} />
      </div>
    </div>
  );
}

