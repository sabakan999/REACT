import { NextResponse } from "next/server";
import fs from "fs";

// データを読み込む関数
function readData() {
  const jsonData = fs.readFileSync("./db.json", "utf-8");
  return JSON.parse(jsonData);
}

// データを書き込む関数
function writeData(data: any) {
  fs.writeFileSync("./db.json", JSON.stringify(data, null, 2));
}

export async function GET() {
  const tweets = readData();
  return NextResponse.json(tweets);
}

export async function POST(request: Request) {
  const body = await request.json();
  const tweets = readData();
  const newTweet = { id: Date.now().toString(), text: body.text };
  tweets.push(newTweet);
  writeData(tweets);
  return NextResponse.json(newTweet);
}


