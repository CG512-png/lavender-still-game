"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  BookOpen,
  BrainCircuit,
  ChevronRight,
  CirclePause,
  FastForward,
  Footprints,
  Gamepad2,
  Heart,
  Home,
  Images,
  LockKeyhole,
  LogOut,
  Maximize2,
  MessageCircle,
  Minimize2,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Sparkles,
  SkipBack,
  Volume2,
  VolumeX,
  Wind,
  X,
} from "lucide-react";

type ImageKey = "auditorium" | "deskmates" | "ceremonybefore" | "ceremony" | "ceremonyafter" | "night" | "stars" | "stairwell" | "treepath" | "library" | "studio";
type Interaction = "projector" | "find" | "desks" | "photo" | "qqchat" | "evidence" | "tremble" | "examplan" | "loop" | "walk" | "lookback" | "closechat" | "keepsake" | "endingchoice" | "rebuild" | "reframe";
type EndingRoute = "stayed" | "healed";
type ExamStats = { focus: number; sleep: number; anxiety: number };
type Beat = {
  kind: "dialogue" | "title" | "interaction";
  image: ImageKey;
  chapter: string;
  date: string;
  speaker?: string;
  text?: string;
  title?: string;
  subtitle?: string;
  interaction?: Interaction;
  mood?: "warm" | "quiet" | "rain" | "pulse" | "summer";
};

const images: Record<ImageKey, string> = {
  auditorium: "./assets/auditorium.webp",
  deskmates: "./assets/deskmates.webp",
  ceremonybefore: "./assets/ceremony-before.webp",
  ceremony: "./assets/ceremony-together.webp",
  ceremonyafter: "./assets/ceremony-after.webp",
  night: "./assets/night-phone.webp",
  stars: "./assets/shared-sky.webp",
  stairwell: "./assets/stairwell.webp",
  treepath: "./assets/treepath.webp",
  library: "./assets/library-answer.webp",
  studio: "./assets/morning-studio.webp",
};

const characterFrames = {
  neutral: "./assets/heroine-puppet-neutral.webp",
  smile: "./assets/heroine-puppet-smile.webp",
  closed: "./assets/heroine-puppet-eyes-closed.webp",
} as const;

const beats: Beat[] = [
  { kind: "title", image: "library", chapter: "序章", date: "现在 · 某个下午", title: "书页", subtitle: "有些答案不是突然出现的。它只是等你终于读到自己。", mood: "quiet" },
  { kind: "dialogue", image: "library", chapter: "序章 · 阅读", date: "16:17", speaker: "现在的我", text: "我坐在图书馆靠窗的位置。阳光落在摊开的书上，也落在我按住页角的手指上。", mood: "quiet" },
  { kind: "dialogue", image: "library", chapter: "序章 · 阅读", date: "同一页", speaker: "书页", text: "现在，想象她的样子。", mood: "warm" },
  { kind: "dialogue", image: "library", chapter: "序章 · 阅读", date: "16:18", speaker: "现在的我", text: "我低头看着自己的手。她没有立刻出现。先出现的是一块过曝的光，然后是一排模糊的椅背。", mood: "quiet" },
  { kind: "dialogue", image: "library", chapter: "序章 · 阅读", date: "记忆开始倒带", speaker: "现在的我", text: "我的记忆像一台旧幻灯机。片盒明明还在转，却偏偏卡在了同一格。", mood: "quiet" },
  { kind: "interaction", image: "library", chapter: "序章 · 幻灯机", date: "MEMORY / 001", interaction: "projector", mood: "quiet" },
  { kind: "title", image: "auditorium", chapter: "第一幕", date: "高一 · 九月", title: "第一眼", subtitle: "那时谁也不知道，一个颜色会在记忆里停留这么久。", mood: "warm" },
  { kind: "dialogue", image: "auditorium", chapter: "第一幕 · 报告厅", date: "高一 · 九月", speaker: "我", text: "报告厅里很热。风扇转得很慢，老师的话被蝉声切成一段一段。", mood: "warm" },
  { kind: "dialogue", image: "auditorium", chapter: "第一幕 · 报告厅", date: "高一 · 九月", speaker: "我", text: "满眼都是一样的军训服。我低头数着椅背，等这场会快点结束。", mood: "warm" },
  { kind: "dialogue", image: "auditorium", chapter: "第一幕 · 报告厅", date: "高一 · 九月", speaker: "老师", text: "后面的同学安静一点。", mood: "warm" },
  { kind: "dialogue", image: "auditorium", chapter: "第一幕 · 报告厅", date: "高一 · 九月", speaker: "我", text: "我抬起头。右前方三排，有什么东西在阳光里轻轻晃了一下。", mood: "warm" },
  { kind: "interaction", image: "auditorium", chapter: "第一幕 · 报告厅", date: "高一 · 九月", interaction: "find", mood: "warm" },
  { kind: "dialogue", image: "auditorium", chapter: "第一幕 · 报告厅", date: "高一 · 九月", speaker: "我", text: "是一根淡紫色的头绳。很普通，甚至没有什么花样。", mood: "warm" },
  { kind: "dialogue", image: "auditorium", chapter: "第一幕 · 报告厅", date: "高一 · 九月", speaker: "我", text: "我没看清她穿了什么，也不知道她叫什么。可很多年后，那天剩下来的偏偏是这个颜色。", mood: "warm" },

  { kind: "title", image: "deskmates", chapter: "第二幕", date: "高一 · 十月", title: "同桌", subtitle: "真正快乐的时候，我们通常不知道那就是快乐。", mood: "warm" },
  { kind: "dialogue", image: "deskmates", chapter: "第二幕 · 同桌", date: "高一 · 十月", speaker: "班主任", text: "你坐到靠窗那边。空位旁边，对。", mood: "warm" },
  { kind: "dialogue", image: "deskmates", chapter: "第二幕 · 同桌", date: "第一天", speaker: "她", text: "先说好，你的书不能越过这条线。", mood: "warm" },
  { kind: "dialogue", image: "deskmates", chapter: "第二幕 · 同桌", date: "第一天", speaker: "我", text: "行。你的卷子也不许过来。", mood: "warm" },
  { kind: "dialogue", image: "deskmates", chapter: "第二幕 · 同桌", date: "第三天", speaker: "我", text: "第三天，她的草稿纸压住了那条线。我装作没看见。", mood: "warm" },
  { kind: "interaction", image: "deskmates", chapter: "第二幕 · 同桌", date: "第三天", interaction: "desks", mood: "warm" },
  { kind: "dialogue", image: "deskmates", chapter: "第二幕 · 同桌", date: "某个下午", speaker: "她", text: "你又把条件看反了。", mood: "warm" },
  { kind: "dialogue", image: "deskmates", chapter: "第二幕 · 同桌", date: "某个下午", speaker: "我", text: "你怎么知道？", mood: "warm" },
  { kind: "dialogue", image: "deskmates", chapter: "第二幕 · 同桌", date: "某个下午", speaker: "她", text: "因为你每次看反题，都会先皱一下眉。", mood: "warm" },
  { kind: "dialogue", image: "deskmates", chapter: "第二幕 · 同桌", date: "某个下午", speaker: "我", text: "她低头继续写题，好像这只是一件很小的事。那时我们只是很合得来的朋友，什么都可以自然地说。", mood: "warm" },
  { kind: "dialogue", image: "deskmates", chapter: "第二幕 · 分班", date: "高一下学期", speaker: "她", text: "我去一楼的文科班。你还是理科吧？", mood: "quiet" },
  { kind: "dialogue", image: "deskmates", chapter: "第二幕 · 分班", date: "高一下学期", speaker: "我", text: "嗯，理科班在二楼。", mood: "quiet" },
  { kind: "dialogue", image: "deskmates", chapter: "第二幕 · 分班", date: "高一下学期", speaker: "她", text: "那以后碰见就难了。", mood: "quiet" },
  { kind: "dialogue", image: "deskmates", chapter: "第二幕 · 分班", date: "高一下学期", speaker: "我", text: "一层楼其实不远。可平时没有事情，我不会特意下一楼，她也很少上二楼。我们确实很难碰见。", mood: "quiet" },
  { kind: "dialogue", image: "deskmates", chapter: "第二幕 · 两层楼", date: "高一至高三", speaker: "我", text: "偶尔在楼梯口遇到，我们会停下来聊几句；见不到的时候，也还是会在手机上分享学校里的小事。", mood: "warm" },
  { kind: "dialogue", image: "deskmates", chapter: "第二幕 · 两层楼", date: "高一至高三", speaker: "我", text: "从高一到高三，我们一直是关系很好的朋友。距离没有让我们疏远，也没有被谁解释成爱情。", mood: "warm" },

  { kind: "title", image: "ceremonybefore", chapter: "第三幕", date: "高三 · 成人礼", title: "失焦", subtitle: "那天以前，我们一直只是很好的朋友。", mood: "warm" },
  { kind: "dialogue", image: "ceremonybefore", chapter: "第三幕 · 成人礼", date: "高三", speaker: "我", text: "从高一到这一天，我从来没有认真想过我们之间应该叫什么。好朋友已经足够准确，也足够安心。", mood: "warm" },
  { kind: "dialogue", image: "ceremonybefore", chapter: "第三幕 · 成人礼", date: "高三", speaker: "同学", text: "你们俩站近一点，我给你们拍一张。来，看镜头。", mood: "warm" },
  { kind: "dialogue", image: "ceremonybefore", chapter: "第三幕 · 成人礼", date: "高三", speaker: "她", text: "你别躲那么远。拍完记得让他发给我。", mood: "warm" },
  { kind: "dialogue", image: "ceremony", chapter: "第三幕 · 成人礼", date: "高三", speaker: "我", text: "我走到她旁边。我们第一次被放进同一个取景框里，肩膀之间只剩不到半步。", mood: "warm" },
  { kind: "interaction", image: "ceremony", chapter: "第三幕 · 成人礼", date: "高三", interaction: "photo", mood: "warm" },
  { kind: "dialogue", image: "ceremonyafter", chapter: "第三幕 · 成人礼", date: "快门以后", speaker: "同学", text: "拍好了。你们刚刚怎么都没看镜头？", mood: "warm" },
  { kind: "dialogue", image: "ceremonyafter", chapter: "第三幕 · 成人礼", date: "快门以后", speaker: "她", text: "你知道吗？还有人祝我们99呢！", mood: "pulse" },
  { kind: "dialogue", image: "ceremonyafter", chapter: "第三幕 · 成人礼", date: "那一秒", speaker: "我", text: "她说得像一个轻松的玩笑。我也笑了，可心里有什么东西忽然停了一拍。", mood: "pulse" },
  { kind: "dialogue", image: "ceremonyafter", chapter: "第三幕 · 成人礼", date: "那一秒", speaker: "她", text: "他们乱说的，你别当真啊。", mood: "pulse" },
  { kind: "dialogue", image: "ceremonyafter", chapter: "第三幕 · 成人礼", date: "那一秒", speaker: "我", text: "她很快把这句话笑过去了。可“我们”和“99”第一次被放在一起，像一枚很轻的锚，沉进了我心里。", mood: "pulse" },
  { kind: "dialogue", image: "ceremonyafter", chapter: "第三幕 · 成人礼", date: "那天以后", speaker: "我", text: "变化是从那天才开始的。以前自然的关心忽然有了重量，连一次普通的对视，我都会在回去以后想很久。", mood: "quiet" },
  { kind: "dialogue", image: "ceremonyafter", chapter: "第三幕 · 成人礼", date: "那天以后", speaker: "我", text: "不是过去早就藏着爱情。是我在高三的成人礼以后，才第一次意识到：我好像喜欢上她了。", mood: "quiet" },

  { kind: "title", image: "night", chapter: "第四幕", date: "成人礼以后", title: "屏幕亮起", subtitle: "从一楼到二楼的距离，后来变成了更远的地方。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第四幕 · 转学", date: "高三", speaker: "她", text: "我要转学了。下周走。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第四幕 · 转学", date: "高三", speaker: "我", text: "我愣了一下，手机从膝盖滑到地上。屏幕裂开一道细纹，像一句没来得及说完的话。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第四幕 · 转学", date: "高三", speaker: "我", text: "这么快？", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第四幕 · 转学", date: "高三", speaker: "她", text: "嗯。别这个表情，又不是以后都见不到。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第四幕 · 转学", date: "高三", speaker: "她", text: "而且以后……我可能会有机会出国。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第四幕 · 转学", date: "高三", speaker: "我", text: "那很好啊。真的，我替你高兴。", mood: "quiet" },
  { kind: "dialogue", image: "night", chapter: "第四幕 · 转学", date: "高三", speaker: "我", text: "这句话不是逞强。舍不得她是真的，为她将要去往更远的地方而高兴，也是真的。两种心情在那一刻同时发生。", mood: "quiet" },
  { kind: "dialogue", image: "night", chapter: "第四幕 · 转学", date: "高三", speaker: "我", text: "以前她在一楼、我在二楼，见面只是需要一个恰好的课间。后来，连“碰巧”也不再可能了。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第四幕 · 夜", date: "00:47", speaker: "我", text: "后来每周那半天假，我都在等屏幕亮起来。不是每次都有消息，但我每次都会等。", mood: "rain" },
  { kind: "interaction", image: "night", chapter: "第四幕 · QQ", date: "01:03", interaction: "qqchat", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第四幕 · 夜", date: "01:09", speaker: "我", text: "转学以后，我们就靠 QQ 聊天。那句“嗯，你也是”，我看了很久，直到屏幕自己暗下去。", mood: "rain" },

  { kind: "title", image: "stars", chapter: "幕间", date: "高三 · 冬夜", title: "同一片夜空", subtitle: "隔着很远的路，我们曾在同一分钟抬头。", mood: "quiet" },
  { kind: "dialogue", image: "stars", chapter: "幕间 · QQ", date: "23:41", speaker: "她", text: "你那边能看见星星吗？", mood: "quiet" },
  { kind: "dialogue", image: "stars", chapter: "幕间 · QQ", date: "23:41", speaker: "我", text: "能。刚才还在做卷子，没注意。", mood: "quiet" },
  { kind: "dialogue", image: "stars", chapter: "幕间 · QQ", date: "23:42", speaker: "她", text: "那就看一分钟再继续。今天的天很干净。", mood: "warm" },
  { kind: "dialogue", image: "stars", chapter: "幕间 · 夜空", date: "23:42", speaker: "我", text: "我们不在同一个地方。她站在她的窗边，我坐在堆满高考卷子的书桌前，却真的看见了同一片夜空。", mood: "warm" },
  { kind: "dialogue", image: "stars", chapter: "幕间 · 夜空", date: "23:43", speaker: "她", text: "高考以后，你想去哪里？", mood: "quiet" },
  { kind: "dialogue", image: "stars", chapter: "幕间 · 夜空", date: "23:43", speaker: "我", text: "先考出去再说。你呢？", mood: "quiet" },
  { kind: "dialogue", image: "stars", chapter: "幕间 · 夜空", date: "23:44", speaker: "她", text: "我想去更远的地方看看。", mood: "quiet" },
  { kind: "dialogue", image: "stars", chapter: "幕间 · 夜空", date: "23:45", speaker: "我", text: "那一分钟很浪漫。也很诚实。我们都在谈未来，却谁也没有说过，未来必须把两个人写在同一行。", mood: "quiet" },

  { kind: "title", image: "stairwell", chapter: "第五幕", date: "二模", title: "证据", subtitle: "人会不会因为一个回头，替一段关系写完所有以后？", mood: "pulse" },
  { kind: "dialogue", image: "stairwell", chapter: "第五幕 · 二模", date: "她回校的第一天", speaker: "我", text: "她回来考试的前三天，我几乎没睡。真正见到她时，我却只敢从楼梯另一边经过。", mood: "pulse" },
  { kind: "dialogue", image: "stairwell", chapter: "第五幕 · 楼梯", date: "16:42", speaker: "我", text: "擦肩。一步。两步。", mood: "pulse" },
  { kind: "dialogue", image: "stairwell", chapter: "第五幕 · 楼梯", date: "16:42", speaker: "我", text: "我回头了。", mood: "pulse" },
  { kind: "dialogue", image: "stairwell", chapter: "第五幕 · 楼梯", date: "16:42", speaker: "我", text: "她也正好回头。那一秒很短，却被我在心里放慢了很多年。", mood: "pulse" },
  { kind: "interaction", image: "stairwell", chapter: "第五幕 · 楼梯", date: "记忆证据 #07", interaction: "evidence", mood: "pulse" },
  { kind: "dialogue", image: "stairwell", chapter: "第五幕 · 第二天", date: "08:16", speaker: "她", text: "我想了想，我们还是不要这样了。对不起。", mood: "quiet" },
  { kind: "dialogue", image: "stairwell", chapter: "第五幕 · 第二天", date: "08:17", speaker: "我", text: "好，我知道了。", mood: "quiet" },
  { kind: "dialogue", image: "stairwell", chapter: "第五幕 · 第二天", date: "08:18", speaker: "我", text: "这句话只用了五秒。后面的很多年，我都在替它补充没有说出口的部分。", mood: "quiet" },
  { kind: "title", image: "night", chapter: "第六幕", date: "二模之后", title: "回声室", subtitle: "最难熬的不是一句拒绝，是大脑替它写出的所有例外。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第六幕 · 凌晨", date: "01:12", speaker: "我", text: "我回到桌前，摊开理综卷子。倒计时还剩四十多天，第一道选择题却看了五遍也读不进去。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第六幕 · 凌晨", date: "01:27", speaker: "我", text: "我又打开 QQ。写了三百多字，想问她那个回头算什么，想问她是不是也有一点舍不得。", mood: "pulse" },
  { kind: "interaction", image: "night", chapter: "第六幕 · 凌晨", date: "01:28", interaction: "tremble", mood: "pulse" },
  { kind: "dialogue", image: "night", chapter: "第六幕 · 凌晨", date: "01:31", speaker: "我", text: "手终于停下来，消息没有发出去。可删掉文字没有删掉问题，它们开始在脑子里一遍遍重写自己。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第六幕 · 倒计时", date: "距离高考 43 天", speaker: "我", text: "白天，我在卷子边上算分数；晚上，我在聊天记录里算她喜欢过我的概率。两张答题卡，没有一张告诉我正确答案。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第六幕 · 晚自习", date: "距离高考 42 天", speaker: "班主任", text: "最后四十多天，不是谁每天熬得最晚谁就赢。把能睡的觉睡够，把会做的题做对。", mood: "quiet" },
  { kind: "interaction", image: "night", chapter: "第六幕 · 双重压力", date: "距离高考 42 天", interaction: "examplan", mood: "pulse" },
  { kind: "dialogue", image: "night", chapter: "第六幕 · 倒计时", date: "距离高考 39 天", speaker: "我", text: "一次模考退步，我先怪自己没睡好；下一秒又拿起手机，怪她为什么偏偏在这个时候走进我的心里。", mood: "pulse" },
  { kind: "dialogue", image: "night", chapter: "第六幕 · 倒计时", date: "距离高考 36 天", speaker: "我", text: "我给她找过很多理由，也给自己找过很多证据。距离、时机、家庭、压力、害怕、出国……", mood: "quiet" },
  { kind: "interaction", image: "night", chapter: "第六幕 · 回声室", date: "凌晨反复 #01", interaction: "loop", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第六幕 · 回声室", date: "02:36", speaker: "我", text: "每一种解释都能让我短暂地好受一点，因为它们都在暗示：不是结束，只是现在不行。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第六幕 · 回声室", date: "02:51", speaker: "我", text: "可高考不会因为我失眠而推迟，分针也不会因为我舍不得就往回走。窗外天快亮了，我还停在昨天。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第六幕 · 教室", date: "距离高考 28 天", speaker: "老师", text: "先把会做的做对。暂时没有答案的题，做上记号，往后走。", mood: "quiet" },
  { kind: "dialogue", image: "night", chapter: "第六幕 · 教室", date: "距离高考 28 天", speaker: "我", text: "我低头看着卷子，忽然觉得这句话不像只是在讲考试。", mood: "quiet" },
  { kind: "dialogue", image: "night", chapter: "第六幕 · 倒计时", date: "距离高考 17 天", speaker: "我", text: "我还是会想她，还是会在提示音响起时心里一紧。但我开始先写完一道题，再允许自己想五分钟。", mood: "quiet" },
  { kind: "dialogue", image: "night", chapter: "第六幕 · 倒计时", date: "距离高考 7 天", speaker: "我", text: "十八岁那年，我最终选择了前途。很久以后我才明白，她也是。我们不是谁战胜了谁，只是都必须先把自己送去更远的地方。", mood: "quiet" },
  { kind: "dialogue", image: "night", chapter: "第六幕 · 天亮前", date: "05:18", speaker: "我", text: "那一刻是真的，心动是真的，舍不得也是真的。可我不需要理解她所有的原因，才能允许这段故事继续往下走。", mood: "quiet" },

  { kind: "title", image: "treepath", chapter: "第七幕", date: "初夏", title: "路口", subtitle: "有些路，只能陪一个人走到这里。", mood: "summer" },
  { kind: "dialogue", image: "treepath", chapter: "第七幕 · 绿荫道", date: "离校前", speaker: "她", text: "送到这里就行啦。你回去吧。", mood: "summer" },
  { kind: "dialogue", image: "treepath", chapter: "第七幕 · 绿荫道", date: "离校前", speaker: "我", text: "没事，顺路。", mood: "summer" },
  { kind: "dialogue", image: "treepath", chapter: "第七幕 · 绿荫道", date: "离校前", speaker: "我", text: "当然不顺路。我只是希望，她再晚一点说“到这里就好”。", mood: "summer" },
  { kind: "dialogue", image: "treepath", chapter: "第七幕 · 绿荫道", date: "离校前", speaker: "她", text: "那我走啦。", mood: "summer" },
  { kind: "dialogue", image: "treepath", chapter: "第七幕 · 绿荫道", date: "离校前", speaker: "我", text: "她走了几步，回头发现我还站在那里，笑了一下，然后跑进树叶漏下来的光里。", mood: "summer" },
  { kind: "interaction", image: "treepath", chapter: "第七幕 · 绿荫道", date: "离校前", interaction: "walk", mood: "summer" },
  { kind: "dialogue", image: "treepath", chapter: "第七幕 · 绿荫道", date: "离校前", speaker: "我", text: "我没有追。直到她的背影被光淹没，我才明白，这条路真的走完了。", mood: "summer" },

  { kind: "title", image: "night", chapter: "第八幕", date: "后来", title: "没有答案的夜", subtitle: "有些问题不是没有答案，只是答案不是我们想要的。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第八幕 · 夜", date: "02:14", speaker: "我", text: "我把聊天记录翻到最开始，又一条一条看回来。像是在废墟里找一扇其实从没存在过的门。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第八幕 · 夜", date: "02:31", speaker: "我", text: "她回头过，她关心过，她也曾需要我。可这些都不能替她说出一句她没有说过的话。", mood: "rain" },
  { kind: "dialogue", image: "night", chapter: "第八幕 · 夜", date: "02:46", speaker: "我", text: "我终于承认：我不是在等她解释。我是在等一个能让我继续等下去的理由。", mood: "quiet" },
  { kind: "interaction", image: "night", chapter: "第八幕 · 夜", date: "02:47", interaction: "closechat", mood: "quiet" },
  { kind: "dialogue", image: "night", chapter: "第八幕 · 夜", date: "02:48", speaker: "我", text: "屏幕暗下去以后，房间没有变得更黑。窗外有车经过，风碰了一下窗帘。", mood: "quiet" },
  { kind: "dialogue", image: "night", chapter: "第八幕 · 夜", date: "02:49", speaker: "我", text: "我第一次听见自己的呼吸。原来在所有关于她的声音下面，我一直都还在。", mood: "quiet" },

  { kind: "title", image: "stars", chapter: "第九幕", date: "高考之后", title: "各自的远方", subtitle: "选择前途，不等于否定曾经并肩走过的路。", mood: "quiet" },
  { kind: "dialogue", image: "stars", chapter: "第九幕 · 高考", date: "最后一门结束", speaker: "我", text: "交卷铃响的那一刻，我没有突然释怀。走出考场时，我还是下意识看了一眼手机。治愈并不会和考试一起准时结束。", mood: "quiet" },
  { kind: "dialogue", image: "stars", chapter: "第九幕 · 录取季", date: "后来", speaker: "我", text: "我开始准备自己的学校和未来。她也继续向她想去的远方走。我们都做了十八岁最难、也最必要的选择：先成为自己。", mood: "quiet" },
  { kind: "dialogue", image: "stars", chapter: "第九幕 · 远方", date: "后来", speaker: "我", text: "听见她可能出国时，我曾经真切地替她高兴。后来我才懂，那份祝福并不需要附带一句“所以别忘了回来”。", mood: "warm" },
  { kind: "dialogue", image: "stars", chapter: "第九幕 · 远方", date: "现在", speaker: "我", text: "她选择前途，不是在否定我；我选择前途，也不是在背叛这段感情。我们只是从同一片星空下，走向了不同的清晨。", mood: "warm" },

  { kind: "title", image: "library", chapter: "第十幕", date: "大一 · 九月", title: "新的城市", subtitle: "换了城市，不等于换掉了脑海里反复播放的那段声音。", mood: "quiet" },
  { kind: "dialogue", image: "library", chapter: "第十幕 · 开学", date: "第一周", speaker: "我", text: "大学比我想象中大。新的教室、新的名字、新的路，可每天晚上安静下来，我还是会回到高三的楼梯口。", mood: "quiet" },
  { kind: "dialogue", image: "library", chapter: "第十幕 · 开学", date: "第十九天", speaker: "室友", text: "图书馆去不去？你不是说想把落下的书补回来吗？", mood: "warm" },
  { kind: "dialogue", image: "library", chapter: "第十幕 · 图书馆", date: "17:26", speaker: "我", text: "我本来只是为了躲开寝室的喧闹。书翻了十几页，一个字也没进脑子，手却又摸到了手机。", mood: "quiet" },
  { kind: "dialogue", image: "library", chapter: "第十幕 · 图书馆", date: "17:41", speaker: "我", text: "我没有点开她的头像。我给自己定了一个很小的任务：先读完眼前两页，再决定今晚要不要难过。", mood: "quiet" },
  { kind: "title", image: "library", chapter: "第十一幕", date: "大一 · 十二月", title: "书页之间", subtitle: "答案不是一句让人立刻释怀的话，而是一种重新理解自己的方式。", mood: "warm" },
  { kind: "dialogue", image: "library", chapter: "第十一幕 · 阅读", date: "一个普通下午", speaker: "我", text: "我在书里慢慢明白：大脑会反复寻找细节，不一定因为那段关系还有未来，而是因为它无法忍受一个没有结论的故事。", mood: "warm" },
  { kind: "dialogue", image: "library", chapter: "第十一幕 · 阅读", date: "同一页", speaker: "我", text: "我一直以为自己在等她。其实更深的地方，我是在等一句证明——证明我当年的认真没有白费，证明我值得被选择。", mood: "quiet" },
  { kind: "dialogue", image: "library", chapter: "第十一幕 · 阅读", date: "窗外天黑以前", speaker: "我", text: "可真心的价值，不需要由结局盖章。她没有留下，不等于我的真心是假的；故事没有成为爱情，也不等于那几年没有意义。", mood: "warm" },
  { kind: "interaction", image: "library", chapter: "第十一幕 · 书页", date: "18:03", interaction: "endingchoice", mood: "quiet" },
];

const endingBeats: Record<EndingRoute, Beat[]> = {
  stayed: [
    { kind: "title", image: "night", chapter: "结局线 · 回声", date: "大一 · 冬", title: "留在这一页", subtitle: "有时人已经走到很远的地方，心却仍住在某个没有发出去的凌晨。", mood: "rain" },
    { kind: "dialogue", image: "night", chapter: "回声 · 图书馆之后", date: "当晚 23:48", speaker: "我", text: "我合上书，还是打开了聊天记录。我告诉自己只是看最后一次。", mood: "rain" },
    { kind: "dialogue", image: "night", chapter: "回声 · 图书馆之后", date: "第二天 00:32", speaker: "我", text: "最后一次又变成了从头到尾。报告厅、成人礼、那个回头，都被我重新排列成另一个本来可能发生的未来。", mood: "rain" },
    { kind: "dialogue", image: "night", chapter: "回声 · 日常", date: "大一下学期", speaker: "我", text: "我照常上课、考试、和别人说笑。只有我知道，每件新鲜的事都要先在心里问一句：如果她在，会不会懂。", mood: "quiet" },
    { kind: "dialogue", image: "night", chapter: "回声 · 日常", date: "大二 · 春", speaker: "朋友", text: "你最近已经很好了。为什么每次提到以后，还是先说她？", mood: "quiet" },
    { kind: "dialogue", image: "night", chapter: "回声 · 日常", date: "大二 · 春", speaker: "我", text: "我说我只是记性好。可真正被我记住的，不是她后来做过什么，是我一遍遍讲述以后越来越熟练的那个版本。", mood: "rain" },
    { kind: "dialogue", image: "night", chapter: "回声 · 未发送", date: "大二 · 夏", speaker: "我", text: "我没有打扰她，也没有真的等在某一扇门前。可我把很多本来属于自己的晚上，都交给了一个不会再更新的对话框。", mood: "rain" },
    { kind: "dialogue", image: "night", chapter: "回声 · 未发送", date: "又一个 02:47", speaker: "我", text: "最难察觉的停留，不是一直哭，而是生活看起来什么都在继续，心里却从未允许任何一天超过那年夏天。", mood: "rain" },
    { kind: "dialogue", image: "night", chapter: "回声 · 日历", date: "大三 · 九月", speaker: "我", text: "手机换过两次，聊天记录却一次次迁移。我害怕丢失的已经不只是她，而是那个靠这段故事确认自己曾经勇敢过的人。", mood: "rain" },
    { kind: "dialogue", image: "night", chapter: "回声 · 日历", date: "毕业那天", speaker: "我", text: "所有人都在拍新的合照。我站在人群里笑，心里仍旧把十八岁的那张照片放在最前面。", mood: "quiet" },
    { kind: "dialogue", image: "night", chapter: "回声 · 未发送", date: "屏幕熄灭前", speaker: "我", text: "我仍然想知道她有没有一瞬间后悔，仍然想用她的答案，决定该怎样评价当年的自己。", mood: "pulse" },
    { kind: "dialogue", image: "night", chapter: "回声 · 未发送", date: "现在", speaker: "我", text: "我不是没有走到后来。我只是把后来的许多路，都走成了返回从前的方向。", mood: "quiet" },
    { kind: "title", image: "night", chapter: "未完成结局", date: "时间仍在继续", title: "灯没有关", subtitle: "这不是失败。只是此刻的你，还没有准备好把答案还给自己。", mood: "rain" },
  ],
  healed: [
    { kind: "title", image: "library", chapter: "重建线 · 第一章", date: "大一 · 冬", title: "先照顾今天", subtitle: "真正的改变没有配乐响起，它只是从一个可以完成的小动作开始。", mood: "warm" },
    { kind: "dialogue", image: "library", chapter: "重建 · 第一周", date: "星期一", speaker: "我", text: "我没有要求自己从此不再想她。我只把手机放远一点，读完计划里的十页，然后在十二点以前睡觉。", mood: "quiet" },
    { kind: "dialogue", image: "library", chapter: "重建 · 第一周", date: "星期三", speaker: "我", text: "第三天我又点开了她的主页。看完以后还是难受。我没有骂自己没出息，只是在纸上写：今天退回去了一步，明天还能再走。", mood: "quiet" },
    { kind: "interaction", image: "library", chapter: "重建 · 第一周", date: "把今天还给自己", interaction: "rebuild", mood: "warm" },
    { kind: "dialogue", image: "library", chapter: "重建 · 第二周", date: "星期六", speaker: "室友", text: "去操场吗？跑不动就走两圈。", mood: "warm" },
    { kind: "dialogue", image: "library", chapter: "重建 · 第二周", date: "晚风里", speaker: "我", text: "我跑了八百米就喘得不行。回寝室洗完澡，那晚第一次不是靠刷聊天记录把自己耗到睡着。", mood: "warm" },
    { kind: "dialogue", image: "library", chapter: "重建 · 一个月", date: "期末以前", speaker: "我", text: "我开始重新听完整的一节课，重新记得按时吃饭，重新在朋友讲笑话时真的笑出来。没有哪件事伟大，但它们一点点把生活的主语改回了我。", mood: "warm" },
    { kind: "dialogue", image: "library", chapter: "重建 · 三个月", date: "大一 · 春", speaker: "我", text: "偶尔想起她时，我不再立刻寻找原因。我会对自己说：是的，你很舍不得。然后继续把手里的这一页读完。", mood: "quiet" },
    { kind: "interaction", image: "stairwell", chapter: "重建 · 三个月", date: "再次查看证据 #07", interaction: "reframe", mood: "quiet" },
    { kind: "dialogue", image: "library", chapter: "重建 · 半年", date: "大一 · 夏", speaker: "我", text: "某天整理收藏夹，我才发现自己已经一个月没有点进她的主页。不是忍住了，是那段时间里有了更想完成的事情。", mood: "summer" },
    { kind: "title", image: "studio", chapter: "重建线 · 第二章", date: "大二至毕业", title: "把人生写回主语", subtitle: "当生活重新变得具体，回忆就不再占满全部画面。", mood: "summer" },
    { kind: "dialogue", image: "studio", chapter: "重建 · 创作", date: "大二 · 秋", speaker: "我", text: "我把那首没写完的歌重新打开。最初每一句都在问她为什么离开，后来我删掉问题，开始写那个留在原地的自己。", mood: "quiet" },
    { kind: "dialogue", image: "studio", chapter: "重建 · 创作", date: "第一个完成的夜晚", speaker: "我", text: "作品完成时，我没有想象她会不会听见。我第一次只是因为自己终于做成了一件事而高兴。", mood: "warm" },
    { kind: "dialogue", image: "studio", chapter: "重建 · 生活", date: "后来的一年", speaker: "我", text: "我认识新朋友，做新的项目，给家里打电话，跑完第一个五公里，也去过一些和她毫无关系的地方。", mood: "summer" },
    { kind: "dialogue", image: "studio", chapter: "重建 · 生活", date: "一个普通周末", speaker: "朋友", text: "今天去哪？", mood: "warm" },
    { kind: "dialogue", image: "studio", chapter: "重建 · 生活", date: "一个普通周末", speaker: "我", text: "我报出了一个从没和她讨论过的地方。说完以后才发现，我已经开始拥有不需要被旧回忆批准的新生活。", mood: "summer" },
    { kind: "dialogue", image: "studio", chapter: "重建 · 生活", date: "某次低潮", speaker: "我", text: "我也有过反复。压力很大时，那段回忆仍会回来，像大脑熟悉的避难所。但这一次，我知道该怎样把自己带回现在。", mood: "quiet" },
    { kind: "dialogue", image: "studio", chapter: "重建 · 毕业前", date: "清晨 05:36", speaker: "我", text: "治愈不是从此再也不疼，而是疼的时候，我不再放弃今天；想起她的时候，我也不会忘记照顾自己。", mood: "warm" },
    { kind: "title", image: "treepath", chapter: "重建线 · 第三章", date: "很多年以后", title: "自己的夏天", subtitle: "有一天，记忆仍然清晰，却终于不再要求你回去。", mood: "summer" },
    { kind: "interaction", image: "treepath", chapter: "自己的夏天 · 回头", date: "很多年以后", interaction: "lookback", mood: "summer" },
    { kind: "dialogue", image: "treepath", chapter: "自己的夏天 · 现在", date: "现在", speaker: "我", text: "我曾经以为，忘掉她才算走出来。后来才明白，记得一个人和继续生活，并不冲突。", mood: "summer" },
    { kind: "interaction", image: "studio", chapter: "自己的夏天 · 旧物", date: "某个晴天", interaction: "keepsake", mood: "summer" },
    { kind: "dialogue", image: "studio", chapter: "自己的夏天 · 清晨", date: "现在", speaker: "我", text: "她后来过着怎样的人生，我已经不再猜了。那是她的故事。而我的早晨，也终于不再需要从她那里开始。", mood: "warm" },
    { kind: "dialogue", image: "studio", chapter: "自己的夏天 · 清晨", date: "现在", speaker: "我", text: "我真正想回去接走的，从来不是她。是那个以为没有被选择，就不值得被爱的十七岁少年。", mood: "warm" },
    { kind: "dialogue", image: "treepath", chapter: "自己的夏天 · 绿荫道", date: "记忆深处", speaker: "现在的我", text: "如果能回到那天，我不会催他放下，也不会告诉他以后一定会遇见更好的人。", mood: "summer" },
    { kind: "dialogue", image: "treepath", chapter: "自己的夏天 · 绿荫道", date: "记忆深处", speaker: "现在的我", text: "我只会坐在他旁边，等他哭完，再告诉他：你当年的认真没有错。没有被选择，也不是你的错。", mood: "summer" },
    { kind: "dialogue", image: "treepath", chapter: "自己的夏天 · 绿荫道", date: "记忆深处", speaker: "现在的我", text: "我们不必把她留住，才能把那段青春带走。走吧，我来接你回家。", mood: "summer" },
    { kind: "title", image: "studio", chapter: "治愈结局", date: "天亮以后", title: "我也记得自己了", subtitle: "谢谢你经过我的青春。剩下的路，我会好好走。", mood: "summer" },
  ],
};

const maxStoryLength = beats.length + Math.max(endingBeats.stayed.length, endingBeats.healed.length);

const gallery = [
  ["报告厅", images.auditorium],
  ["同桌", images.deskmates],
  ["成人礼", images.ceremony],
  ["屏幕亮起", images.night],
  ["同一片夜空", images.stars],
  ["楼梯回头", images.stairwell],
  ["跑进光里", images.treepath],
  ["书页之间", images.library],
  ["天亮以后", images.studio],
] as const;

const spokenFirstPersonLines = new Set([
  "行。你的卷子也不许过来。",
  "你怎么知道？",
  "嗯，理科班在二楼。",
  "这么快？",
  "那很好啊。真的，我替你高兴。",
  "能。刚才还在做卷子，没注意。",
  "先考出去再说。你呢？",
  "好，我知道了。",
  "没事，顺路。",
]);

const isInnerMonologue = (item: Beat) => item.kind === "dialogue" && (
  item.speaker === "现在的我" || (item.speaker === "我" && !spokenFirstPersonLines.has(item.text || ""))
);

export default function Home() {
  const [started, setStarted] = useState(false);
  const [beatIndex, setBeatIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [typing, setTyping] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [auto, setAuto] = useState(false);
  const [deskDistance, setDeskDistance] = useState(12);
  const [focus, setFocus] = useState(20);
  const [draft, setDraft] = useState("我好像不是只把你当朋友。");
  const [qqStep, setQqStep] = useState(0);
  const [loopStep, setLoopStep] = useState(0);
  const [evidence, setEvidence] = useState<string | null>(null);
  const [hold, setHold] = useState(0);
  const [lookbacks, setLookbacks] = useState(0);
  const [keepsakeChoice, setKeepsakeChoice] = useState<"keep" | "release" | null>(null);
  const [finished, setFinished] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [savedBeat, setSavedBeat] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [paused, setPaused] = useState(false);
  const [maxUnlocked, setMaxUnlocked] = useState(0);
  const [endingRoute, setEndingRoute] = useState<EndingRoute | null>(null);
  const [breathingMoment, setBreathingMoment] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [textSpeed, setTextSpeed] = useState(1);
  const [masterVolume, setMasterVolume] = useState(.82);
  const [musicVolume, setMusicVolume] = useState(.72);
  const [ambienceVolume, setAmbienceVolume] = useState(.58);
  const [sfxVolume, setSfxVolume] = useState(.78);
  const [examStep, setExamStep] = useState(0);
  const [examStats, setExamStats] = useState<ExamStats>({ focus: 58, sleep: 46, anxiety: 74 });
  const [examLog, setExamLog] = useState<string[]>([]);
  const [rebuildChoices, setRebuildChoices] = useState<string[]>([]);
  const [controllerConnected, setControllerConnected] = useState(false);
  const [saveSlots, setSaveSlots] = useState<Array<number | null>>([null, null, null]);
  const stageRef = useRef<HTMLElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<GainNode | null>(null);
  const windRef = useRef<GainNode | null>(null);
  const musicBusRef = useRef<GainNode | null>(null);
  const ambienceBusRef = useRef<GainNode | null>(null);
  const sfxBusRef = useRef<GainNode | null>(null);
  const musicTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathSampleRef = useRef<HTMLAudioElement | null>(null);
  const musicStepRef = useRef(0);
  const moodRef = useRef<Beat["mood"]>("warm");
  const soundOnRef = useRef(soundOn);
  const holdRef = useRef(hold);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const deleteTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const launchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathSceneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gamepadLatchRef = useRef({ accept: false, menu: false, back: false });

  const sequence = useMemo(() => endingRoute ? [...beats, ...endingBeats[endingRoute]] : beats, [endingRoute]);
  const beat = sequence[beatIndex];
  const progressLength = endingRoute ? sequence.length : maxStoryLength;
  const progress = Math.min(100, Math.round(((beatIndex + 1) / progressLength) * 100));
  const innerMonologue = isInnerMonologue(beat);

  const textTick = (index: number, character: string) => {
    const ctx = audioRef.current;
    const output = sfxBusRef.current;
    if (!ctx || !output || !soundOnRef.current || index % 2 !== 0 || /[，。！？、：“”……\s]/.test(character)) return;
    if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
    const duration = .052;
    const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const envelope = Math.exp(-i / (ctx.sampleRate * .016));
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    const paper = ctx.createBufferSource();
    const paperFilter = ctx.createBiquadFilter();
    const paperGain = ctx.createGain();
    const bell = ctx.createOscillator();
    const bellFilter = ctx.createBiquadFilter();
    const bellGain = ctx.createGain();
    const now = ctx.currentTime;
    paperFilter.type = "bandpass";
    paperFilter.frequency.value = innerMonologue ? 920 : 1260;
    paperFilter.Q.value = .48;
    paperGain.gain.setValueAtTime(.0001, now);
    paperGain.gain.linearRampToValueAtTime(innerMonologue ? .0105 : .0135, now + .008);
    paperGain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    bell.type = "sine";
    bell.frequency.setValueAtTime((innerMonologue ? 620 : 760) + (index % 5) * 13, now);
    bell.frequency.exponentialRampToValueAtTime(innerMonologue ? 570 : 690, now + .042);
    bellFilter.type = "lowpass";
    bellFilter.frequency.value = 1450;
    bellGain.gain.setValueAtTime(.0001, now);
    bellGain.gain.linearRampToValueAtTime(innerMonologue ? .012 : .016, now + .006);
    bellGain.gain.exponentialRampToValueAtTime(.0001, now + .058);
    paper.buffer = buffer;
    paper.connect(paperFilter).connect(paperGain).connect(output);
    bell.connect(bellFilter).connect(bellGain).connect(output);
    paper.start(now);
    bell.start(now);
    bell.stop(now + .065);
  };

  const playBreath = (strength = 1) => {
    if (!soundOnRef.current) return;
    const breath = breathSampleRef.current || new Audio("./assets/human-breath.mp3");
    breathSampleRef.current = breath;
    breath.pause();
    breath.currentTime = 0;
    breath.volume = Math.min(.5, .42 * strength * masterVolume * sfxVolume);
    void breath.play().catch(() => undefined);
  };

  useEffect(() => {
    moodRef.current = beat.mood || "quiet";
  }, [beat.mood]);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    const wakeAudio = () => {
      const ctx = audioRef.current;
      if (ctx?.state === "suspended") void ctx.resume().catch(() => undefined);
    };
    window.addEventListener("pointerdown", wakeAudio, { passive: true });
    window.addEventListener("keydown", wakeAudio);
    return () => {
      window.removeEventListener("pointerdown", wakeAudio);
      window.removeEventListener("keydown", wakeAudio);
    };
  }, []);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    const preloaders = [...Object.values(images), ...Object.values(characterFrames)].map((src) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
      return image;
    });
    return () => preloaders.forEach((image) => { image.src = ""; });
  }, []);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem("lavender-save-v3") || "0");
    const unlocked = Number(window.localStorage.getItem("lavender-unlocked-v1") || saved || "0");
    const route = window.localStorage.getItem("lavender-ending-route");
    try {
      const slots = JSON.parse(window.localStorage.getItem("lavender-slots-v1") || "null") as Array<number | null> | null;
      if (Array.isArray(slots) && slots.length === 3) setSaveSlots(slots.map((value) => typeof value === "number" ? value : null));
    } catch { /* ignore damaged save slots */ }
    try {
      const audio = JSON.parse(window.localStorage.getItem("lavender-audio-v1") || "null") as Partial<{ masterVolume: number; musicVolume: number; ambienceVolume: number; sfxVolume: number; textSpeed: number }> | null;
      if (audio) {
        if (typeof audio.masterVolume === "number") setMasterVolume(audio.masterVolume);
        if (typeof audio.musicVolume === "number") setMusicVolume(audio.musicVolume);
        if (typeof audio.ambienceVolume === "number") setAmbienceVolume(audio.ambienceVolume);
        if (typeof audio.sfxVolume === "number") setSfxVolume(audio.sfxVolume);
        if (typeof audio.textSpeed === "number") setTextSpeed(audio.textSpeed);
      }
    } catch { /* ignore damaged local preferences */ }
    if (route === "stayed" || route === "healed") setEndingRoute(route);
    if (saved > 0 && saved < maxStoryLength) setSavedBeat(saved);
    if (unlocked > 0 && unlocked < maxStoryLength) setMaxUnlocked(unlocked);
  }, []);

  useEffect(() => {
    if (!started || finished || paused) return;
    window.localStorage.setItem("lavender-save-v3", String(beatIndex));
    setMaxUnlocked((value) => {
      const next = Math.max(value, beatIndex);
      window.localStorage.setItem("lavender-unlocked-v1", String(next));
      return next;
    });
    if (beat.kind !== "dialogue" || !beat.text) {
      setTyped("");
      setTyping(false);
      return;
    }
    setTyped("");
    setTyping(true);
    let cursor = 0;
    const timer = window.setInterval(() => {
      cursor += 1;
      setTyped(beat.text!.slice(0, cursor));
      textTick(cursor, beat.text![cursor - 1] || "");
      if (cursor >= beat.text!.length) {
        window.clearInterval(timer);
        setTyping(false);
      }
    }, Math.max(14, Math.round(38 / textSpeed)));
    return () => window.clearInterval(timer);
  }, [beatIndex, started, finished, paused, beat.kind, beat.text, textSpeed]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const ctx = audioRef.current;
    const wind = windRef.current;
    if (!ctx || !wind) return;
    const level = beat.mood === "summer" ? .00145 : beat.mood === "rain" ? .00072 : beat.mood === "quiet" ? .0009 : .00055;
    wind.gain.setTargetAtTime(soundOn && started && !paused ? level : 0, ctx.currentTime, 1.4);
  }, [beatIndex, beat.mood, soundOn, started, paused]);

  useEffect(() => {
    if (!auto || typing || beat.kind !== "dialogue" || finished || paused) return;
    const timer = window.setTimeout(() => advance(), 1300 + (beat.text?.length || 0) * 25);
    return () => window.clearTimeout(timer);
  }, [auto, typing, beatIndex, finished, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!started || beat.kind !== "title" || paused) return;
    const timer = window.setTimeout(() => advance(), beatIndex === sequence.length - 1 ? 5600 : 2800);
    return () => window.clearTimeout(timer);
  }, [started, beatIndex, beat.kind, paused, sequence.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const ctx = audioRef.current;
    const output = ambientRef.current;
    if (!ctx || !output) return;
    output.gain.setTargetAtTime(soundOn ? masterVolume * (paused ? .16 : 1) : 0, ctx.currentTime, .12);
  }, [paused, soundOn, masterVolume]);

  useEffect(() => {
    const ctx = audioRef.current;
    if (!ctx) return;
    musicBusRef.current?.gain.setTargetAtTime(musicVolume, ctx.currentTime, .18);
    ambienceBusRef.current?.gain.setTargetAtTime(ambienceVolume, ctx.currentTime, .18);
    sfxBusRef.current?.gain.setTargetAtTime(sfxVolume, ctx.currentTime, .12);
    window.localStorage.setItem("lavender-audio-v1", JSON.stringify({ masterVolume, musicVolume, ambienceVolume, sfxVolume, textSpeed }));
  }, [masterVolume, musicVolume, ambienceVolume, sfxVolume, textSpeed]);

  useEffect(() => {
    if (!started || finished) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Escape") return;
      event.preventDefault();
      setAuto(false);
      setPaused((value) => !value);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [started, finished]);

  useEffect(() => () => {
    if (holdTimer.current) clearInterval(holdTimer.current);
    if (deleteTimer.current) clearInterval(deleteTimer.current);
    if (musicTimerRef.current) clearTimeout(musicTimerRef.current);
    if (launchTimerRef.current) clearTimeout(launchTimerRef.current);
    if (breathSceneTimerRef.current) clearTimeout(breathSceneTimerRef.current);
    breathSampleRef.current?.pause();
    audioRef.current?.close();
  }, []);

  const playScoreNote = (ctx: AudioContext, output: GainNode, frequency: number, duration = 2.8, velocity = .042, delaySeconds = 0) => {
    const now = ctx.currentTime + delaySeconds;
    const filter = ctx.createBiquadFilter();
    const envelope = ctx.createGain();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2350, now);
    filter.frequency.exponentialRampToValueAtTime(980, now + duration);
    filter.Q.value = .55;
    envelope.gain.setValueAtTime(.0001, now);
    envelope.gain.exponentialRampToValueAtTime(velocity, now + .018);
    envelope.gain.exponentialRampToValueAtTime(Math.max(.0002, velocity * .42), now + .24);
    envelope.gain.exponentialRampToValueAtTime(.0001, now + duration);
    filter.connect(envelope).connect(output);

    const felt = ctx.createOscillator();
    const air = ctx.createOscillator();
    const warmth = ctx.createOscillator();
    const airGain = ctx.createGain();
    const warmthGain = ctx.createGain();
    felt.type = "triangle";
    felt.frequency.setValueAtTime(frequency, now);
    air.type = "sine";
    air.frequency.setValueAtTime(frequency * 2.005, now);
    warmth.type = "sine";
    warmth.frequency.setValueAtTime(frequency / 2, now);
    airGain.gain.value = .16;
    warmthGain.gain.value = .2;
    felt.connect(filter);
    air.connect(airGain).connect(filter);
    warmth.connect(warmthGain).connect(filter);
    felt.start(now);
    air.start(now);
    warmth.start(now);
    felt.stop(now + duration + .08);
    air.stop(now + duration + .08);
    warmth.stop(now + duration + .08);

    const delay = ctx.createDelay(.8);
    const echo = ctx.createGain();
    delay.delayTime.value = .31;
    echo.gain.value = .16;
    envelope.connect(delay).connect(echo).connect(output);
  };

  const playGuitarPluck = (ctx: AudioContext, output: GainNode, frequency: number, velocity = .025, delaySeconds = 0) => {
    const now = ctx.currentTime + delaySeconds;
    const body = ctx.createBiquadFilter();
    const envelope = ctx.createGain();
    const string = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    body.type = "lowpass";
    body.frequency.setValueAtTime(3300, now);
    body.frequency.exponentialRampToValueAtTime(620, now + 1.45);
    body.Q.value = 1.6;
    envelope.gain.setValueAtTime(.0001, now);
    envelope.gain.exponentialRampToValueAtTime(velocity, now + .007);
    envelope.gain.exponentialRampToValueAtTime(.0001, now + 1.7);
    string.type = "triangle";
    string.frequency.setValueAtTime(frequency, now);
    string.detune.setValueAtTime(-3, now);
    overtone.type = "sine";
    overtone.frequency.setValueAtTime(frequency * 2.002, now);
    overtoneGain.gain.value = .14;
    string.connect(body);
    overtone.connect(overtoneGain).connect(body);
    body.connect(envelope).connect(output);
    string.start(now);
    overtone.start(now);
    string.stop(now + 1.75);
    overtone.stop(now + 1.75);
  };

  const playSoftBass = (ctx: AudioContext, output: GainNode, frequency: number, velocity = .022) => {
    const now = ctx.currentTime;
    const bass = ctx.createOscillator();
    const envelope = ctx.createGain();
    bass.type = "sine";
    bass.frequency.setValueAtTime(frequency, now);
    envelope.gain.setValueAtTime(.0001, now);
    envelope.gain.exponentialRampToValueAtTime(velocity, now + .025);
    envelope.gain.exponentialRampToValueAtTime(.0001, now + 1.5);
    bass.connect(envelope).connect(output);
    bass.start(now);
    bass.stop(now + 1.55);
  };

  const playSoftBeat = (ctx: AudioContext, output: GainNode, kind: "kick" | "rim", velocity = .018) => {
    const now = ctx.currentTime;
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(velocity, now);
    envelope.gain.exponentialRampToValueAtTime(.0001, now + (kind === "kick" ? .22 : .08));
    if (kind === "kick") {
      const drum = ctx.createOscillator();
      drum.type = "sine";
      drum.frequency.setValueAtTime(112, now);
      drum.frequency.exponentialRampToValueAtTime(46, now + .16);
      drum.connect(envelope).connect(output);
      drum.start(now);
      drum.stop(now + .23);
      return;
    }
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * .09), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * .018));
    const noise = ctx.createBufferSource();
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 2300;
    noise.buffer = buffer;
    noise.connect(highpass).connect(envelope).connect(output);
    noise.start(now);
  };

  const startScore = (ctx: AudioContext, output: GainNode) => {
    const themes: Record<NonNullable<Beat["mood"]>, Array<number | null>> = {
      warm: [392,466.16,523.25,null,466.16,392,349.23,null,415.3,466.16,523.25,622.25,587.33,523.25,466.16,null,392,466.16,523.25,null,587.33,523.25,466.16,415.3,392,349.23,311.13,null,349.23,392,null,null],
      quiet: [392,null,466.16,523.25,null,466.16,392,null,349.23,null,392,466.16,null,415.3,392,null,311.13,null,349.23,392,null,466.16,415.3,null,392,349.23,311.13,null,293.66,null,null,null],
      rain: [466.16,415.3,392,null,349.23,311.13,null,293.66,349.23,392,415.3,null,392,349.23,311.13,null,392,415.3,466.16,523.25,466.16,415.3,392,null,349.23,311.13,293.66,null,311.13,null,null,null],
      pulse: [392,466.16,523.25,622.25,587.33,523.25,466.16,null,415.3,523.25,622.25,698.46,622.25,587.33,523.25,null,466.16,523.25,622.25,698.46,783.99,698.46,622.25,null,587.33,523.25,466.16,415.3,392,null,null,null],
      summer: [466.16,523.25,622.25,null,698.46,622.25,587.33,523.25,466.16,523.25,587.33,622.25,587.33,523.25,466.16,null,392,466.16,523.25,622.25,698.46,622.25,523.25,null,466.16,415.3,392,349.23,392,null,null,null],
    };
    const progressions: Record<NonNullable<Beat["mood"]>, number[][]> = {
      warm: [[130.81,155.56,196],[103.83,130.81,155.56],[116.54,155.56,174.61],[116.54,146.83,174.61]],
      quiet: [[130.81,155.56,196],[103.83,130.81,155.56],[116.54,155.56,174.61],[116.54,146.83,174.61]],
      rain: [[130.81,155.56,196],[116.54,146.83,174.61],[103.83,130.81,155.56],[116.54,155.56,174.61]],
      pulse: [[130.81,155.56,196],[103.83,130.81,155.56],[116.54,155.56,174.61],[116.54,146.83,174.61]],
      summer: [[116.54,155.56,174.61],[116.54,146.83,174.61],[130.81,155.56,196],[103.83,130.81,155.56]],
    };
    const tempo: Record<NonNullable<Beat["mood"]>, number> = { warm: 78, quiet: 72, rain: 70, pulse: 82, summer: 76 };
    const intensity: Record<NonNullable<Beat["mood"]>, number> = { warm: .043, quiet: .035, rain: .041, pulse: .049, summer: .043 };
    let previousMood = moodRef.current || "warm";
    const tick = () => {
      const mood = moodRef.current || "quiet";
      if (mood !== previousMood) {
        musicStepRef.current = 0;
        previousMood = mood;
      }
      const step = musicStepRef.current % 32;
      const chord = progressions[mood][Math.floor(step / 8) % 4];
      const melody = themes[mood][step];
      const eighthMs = 30000 / tempo[mood];
      const guitarPattern = [0,2,1,2];
      if (step % 2 === 0) {
        const toneIndex = guitarPattern[(step / 2) % guitarPattern.length];
        playGuitarPluck(ctx, output, chord[toneIndex] * 2, mood === "quiet" ? .021 : .029);
        playGuitarPluck(ctx, output, chord[(toneIndex + 1) % 3] * 2, .012, .075);
      }
      if (melody) playScoreNote(ctx, output, melody, 1.8, intensity[mood]);
      if (step % 8 === 0 || step % 8 === 4) playSoftBass(ctx, output, chord[0] / 2, mood === "pulse" ? .034 : .024);
      if (step % 8 === 0 || (mood === "pulse" && step % 8 === 4)) playSoftBeat(ctx, output, "kick", mood === "quiet" ? .011 : .021);
      if (step % 8 === 4 && mood !== "quiet") playSoftBeat(ctx, output, "rim", mood === "pulse" ? .021 : .015);
      musicStepRef.current += 1;
      musicTimerRef.current = setTimeout(tick, eighthMs);
    };
    tick();
  };

  const initAudio = () => {
    if (audioRef.current) {
      audioRef.current.resume();
      return;
    }
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = new AudioCtor();
    const master = ctx.createGain();
    const musicBus = ctx.createGain();
    const ambienceBus = ctx.createGain();
    const sfxBus = ctx.createGain();
    const limiter = ctx.createDynamicsCompressor();
    master.gain.value = soundOn ? masterVolume : 0;
    musicBus.gain.value = musicVolume;
    ambienceBus.gain.value = ambienceVolume;
    sfxBus.gain.value = sfxVolume;
    limiter.threshold.value = -16;
    limiter.knee.value = 16;
    limiter.ratio.value = 5;
    limiter.attack.value = .006;
    limiter.release.value = .24;
    musicBus.connect(master);
    ambienceBus.connect(master);
    sfxBus.connect(master);
    master.connect(limiter).connect(ctx.destination);
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1;
      brown = (brown + white * .018) / 1.018;
      data[i] = brown * .11;
    }
    const source = ctx.createBufferSource();
    const highpass = ctx.createBiquadFilter();
    const lowpass = ctx.createBiquadFilter();
    const room = ctx.createGain();
    const breezeLfo = ctx.createOscillator();
    const breezeDepth = ctx.createGain();
    highpass.type = "highpass";
    highpass.frequency.value = 48;
    highpass.Q.value = .2;
    lowpass.type = "lowpass";
    lowpass.frequency.value = 360;
    lowpass.Q.value = .18;
    room.gain.value = 0;
    breezeLfo.type = "sine";
    breezeLfo.frequency.value = .065;
    breezeDepth.gain.value = 42;
    source.buffer = buffer;
    source.loop = true;
    source.connect(highpass).connect(lowpass).connect(room).connect(ambienceBus);
    breezeLfo.connect(breezeDepth).connect(lowpass.frequency);
    source.start();
    breezeLfo.start();
    audioRef.current = ctx;
    ambientRef.current = master;
    musicBusRef.current = musicBus;
    ambienceBusRef.current = ambienceBus;
    sfxBusRef.current = sfxBus;
    windRef.current = room;
    startScore(ctx, musicBus);
  };

  const tone = (frequency: number, duration: number, volume = .04) => {
    const ctx = audioRef.current;
    if (!ctx || !soundOn) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * .62, ctx.currentTime + Math.min(.018, duration * .22));
    gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + duration + .08);
    oscillator.connect(gain).connect(sfxBusRef.current || ambientRef.current || ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration + .09);
  };

  const foley = (kind: "page" | "shutter" | "message") => {
    const ctx = audioRef.current;
    const output = sfxBusRef.current;
    if (!ctx || !output || !soundOnRef.current) return;
    if (kind === "message") {
      tone(659.25, .11, .032);
      window.setTimeout(() => tone(880, .16, .027), 95);
      return;
    }
    const duration = kind === "page" ? .34 : .13;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const t = i / data.length;
      const envelope = kind === "page" ? Math.sin(Math.PI * t) * (1 - t * .45) : Math.exp(-t * 9);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    filter.type = "bandpass";
    filter.frequency.value = kind === "page" ? 720 : 1850;
    filter.Q.value = kind === "page" ? .42 : .75;
    gain.gain.value = kind === "page" ? .012 : .026;
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(output);
    source.start();
  };

  useEffect(() => {
    if (!started || paused || beat.kind !== "title") return;
    const timer = window.setTimeout(() => foley("page"), 240);
    return () => window.clearTimeout(timer);
  }, [started, paused, beatIndex, beat.kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSound = () => {
    initAudio();
    setSoundOn((value) => {
      ambientRef.current?.gain.setTargetAtTime(value ? 0 : masterVolume, audioRef.current?.currentTime || 0, .08);
      if (value) breathSampleRef.current?.pause();
      return !value;
    });
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setIsFullscreen(false);
    }
  };

  const startGame = (from = 0) => {
    initAudio();
    if (from === 0) {
      setEndingRoute(null);
      setEvidence(null);
      setExamStep(0);
      setExamStats({ focus: 58, sleep: 46, anxiety: 74 });
      setExamLog([]);
      setRebuildChoices([]);
      window.localStorage.removeItem("lavender-ending-route");
    }
    if (started) {
      setBeatIndex(from);
      setFinished(false);
      setGalleryOpen(false);
      setPaused(false);
      tone(330, .25, .035);
      return;
    }
    if (launching) return;
    setLaunching(true);
    tone(196, .9, .045);
    window.setTimeout(() => tone(392, .7, .04), 360);
    launchTimerRef.current = window.setTimeout(() => {
      setBeatIndex(from);
      setStarted(true);
      setFinished(false);
      setGalleryOpen(false);
      setPaused(false);
      setLaunching(false);
    }, 1450);
  };

  const resetInteraction = () => {
    setDeskDistance(12);
    setFocus(20);
    setDraft("我好像不是只把你当朋友。");
    setQqStep(0);
    setLoopStep(0);
    setHold(0);
    holdRef.current = 0;
    setLookbacks(0);
    setKeepsakeChoice(null);
    setBreathingMoment(false);
  };

  const advance = () => {
    tone(260, .045, .018);
    if (beatIndex >= sequence.length - 1) {
      setFinished(true);
      window.localStorage.setItem("lavender-save-v3", "0");
      return;
    }
    resetInteraction();
    setBeatIndex((value) => value + 1);
  };

  const chooseEnding = (route: EndingRoute) => {
    setEndingRoute(route);
    window.localStorage.setItem("lavender-ending-route", route);
    resetInteraction();
    setBeatIndex(beats.length);
    tone(route === "healed" ? 392 : 196, .65, .026);
  };

  const playBreathingMoment = () => {
    if (breathingMoment) return;
    setBreathingMoment(true);
    const ctx = audioRef.current;
    if (ctx && ambientRef.current) ambientRef.current.gain.setTargetAtTime(soundOn ? .045 : 0, ctx.currentTime, .35);
    playBreath(1.12);
    breathSceneTimerRef.current = window.setTimeout(() => {
      if (ctx && ambientRef.current) ambientRef.current.gain.setTargetAtTime(soundOn ? .82 : 0, ctx.currentTime, .55);
      setBreathingMoment(false);
      advance();
    }, 6200);
  };

  const openPause = () => {
    if (typing && beat.text) setTyped(beat.text);
    setTyping(false);
    setAuto(false);
    setPaused(true);
    tone(220, .16, .025);
  };

  const jumpToBeat = (index: number) => {
    if (index > maxUnlocked) return;
    resetInteraction();
    setBeatIndex(index);
    setFinished(false);
    setPaused(false);
    tone(392, .2, .03);
  };

  const previousBeat = () => jumpToBeat(Math.max(0, beatIndex - 1));

  const writeSaveSlot = (slot: number) => {
    setSaveSlots((value) => {
      const next = [...value];
      next[slot] = beatIndex;
      window.localStorage.setItem("lavender-slots-v1", JSON.stringify(next));
      return next;
    });
    tone(523.25, .22, .03);
  };

  const loadSaveSlot = (slot: number) => {
    const target = saveSlots[slot];
    if (target === null || target > maxUnlocked || target >= sequence.length) return;
    jumpToBeat(target);
  };

  const returnToTitle = () => {
    window.localStorage.setItem("lavender-save-v3", String(beatIndex));
    setSavedBeat(beatIndex);
    setPaused(false);
    setAuto(false);
    setStarted(false);
    setFinished(false);
  };

  const exitSession = async () => {
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch { /* browser owns fullscreen state */ }
    }
    returnToTitle();
  };

  const returnToEndingChoice = () => {
    setEndingRoute(null);
    window.localStorage.removeItem("lavender-ending-route");
    setBeatIndex(beats.length - 1);
    setFinished(false);
    setStarted(true);
    setGalleryOpen(false);
  };

  const onStageClick = () => {
    if (paused) return;
    if (beat.kind !== "dialogue") return;
    if (typing && beat.text) {
      setTyped(beat.text);
      setTyping(false);
      return;
    }
    advance();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
    event.currentTarget.style.setProperty("--mx", x.toFixed(3));
    event.currentTarget.style.setProperty("--my", y.toFixed(3));
    event.currentTarget.style.setProperty("--cg-x", `${(x * 11).toFixed(2)}px`);
    event.currentTarget.style.setProperty("--cg-y", `${(y * 7).toFixed(2)}px`);
    event.currentTarget.style.setProperty("--cg-x-soft", `${(x * 4).toFixed(2)}px`);
    event.currentTarget.style.setProperty("--cg-y-soft", `${(y * 3).toFixed(2)}px`);
  };

  const startDelete = () => {
    if (deleteTimer.current) return;
    tone(190, .04, .02);
    deleteTimer.current = setInterval(() => {
      setDraft((value) => {
        if (!value) {
          if (deleteTimer.current) clearInterval(deleteTimer.current);
          deleteTimer.current = null;
          return "";
        }
        return value.slice(0, -1);
      });
    }, 70);
  };

  const stopDelete = () => {
    if (deleteTimer.current) clearInterval(deleteTimer.current);
    deleteTimer.current = null;
  };

  const startHold = () => {
    if (holdTimer.current || holdRef.current >= 100) return;
    holdTimer.current = setInterval(() => {
      setHold((value) => {
        const next = Math.min(100, value + 3);
        holdRef.current = next;
        if (next === 100 && holdTimer.current) {
          clearInterval(holdTimer.current);
          holdTimer.current = null;
          tone(146, .5, .06);
        }
        return next;
      });
    }, 42);
  };

  const stopHold = () => {
    if (holdTimer.current) clearInterval(holdTimer.current);
    holdTimer.current = null;
    if (holdRef.current < 100) {
      setHold((value) => {
        const next = Math.max(0, value - 12);
        holdRef.current = next;
        return next;
      });
    }
  };

  const makeExamChoice = (label: string, change: ExamStats) => {
    const clamp = (value: number) => Math.max(0, Math.min(100, value));
    setExamStats((value) => ({
      focus: clamp(value.focus + change.focus),
      sleep: clamp(value.sleep + change.sleep),
      anxiety: clamp(value.anxiety + change.anxiety),
    }));
    setExamLog((value) => [...value, label]);
    setExamStep((value) => value + 1);
    tone(change.anxiety < 0 ? 392 : 176, .24, .036);
  };

  useEffect(() => {
    if (!started || paused || beat.interaction !== "walk") return;
    const keyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyW") return;
      event.preventDefault();
      if (!event.repeat) startHold();
    };
    const keyUp = (event: KeyboardEvent) => {
      if (event.code !== "KeyW") return;
      event.preventDefault();
      stopHold();
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      if (holdTimer.current) clearInterval(holdTimer.current);
      holdTimer.current = null;
    };
  }, [started, paused, beat.interaction]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const connected = () => setControllerConnected(true);
    const disconnected = () => setControllerConnected(Boolean(navigator.getGamepads?.().some(Boolean)));
    window.addEventListener("gamepadconnected", connected);
    window.addEventListener("gamepaddisconnected", disconnected);
    setControllerConnected(Boolean(navigator.getGamepads?.().some(Boolean)));
    return () => {
      window.removeEventListener("gamepadconnected", connected);
      window.removeEventListener("gamepaddisconnected", disconnected);
    };
  }, []);

  useEffect(() => {
    if (!started || finished) return;
    let frame = 0;
    const poll = () => {
      const pad = navigator.getGamepads?.()[0];
      if (pad) {
        const accept = Boolean(pad.buttons[0]?.pressed);
        const menu = Boolean(pad.buttons[9]?.pressed);
        const back = Boolean(pad.buttons[14]?.pressed);
        if (accept && !gamepadLatchRef.current.accept) {
          if (paused) setPaused(false);
          else if (beat.kind === "dialogue") {
            if (typing && beat.text) { setTyped(beat.text); setTyping(false); }
            else advance();
          }
        }
        if (menu && !gamepadLatchRef.current.menu) { setAuto(false); setPaused((value) => !value); }
        if (back && !gamepadLatchRef.current.back && paused) previousBeat();
        gamepadLatchRef.current = { accept, menu, back };
      }
      frame = window.requestAnimationFrame(poll);
    };
    frame = window.requestAnimationFrame(poll);
    return () => window.cancelAnimationFrame(frame);
  }, [started, finished, paused, beatIndex, beat.kind, beat.text, typing]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!started || finished) return;
    const keyboardAdvance = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("button,input") || paused || beat.kind !== "dialogue" || !["Enter", "Space"].includes(event.code)) return;
      event.preventDefault();
      if (typing && beat.text) { setTyped(beat.text); setTyping(false); }
      else advance();
    };
    window.addEventListener("keydown", keyboardAdvance);
    return () => window.removeEventListener("keydown", keyboardAdvance);
  }, [started, finished, paused, beatIndex, beat.kind, beat.text, typing]); // eslint-disable-line react-hooks/exhaustive-deps

  const sceneStyle = useMemo(() => ({ backgroundImage: `url(${images[beat.image]})` }), [beat.image]);

  if (!started) {
    return (
      <main className={`game-shell menu-shell ${launching ? "is-launching" : ""}`} data-cursor="探索" onPointerMove={onPointerMove}>
        <MemoryCursor />
        <button className="fullscreen-toggle menu-fullscreen" data-cursor="全屏" onClick={toggleFullscreen} aria-label={isFullscreen ? "退出全屏" : "进入全屏"}>
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}<span>{isFullscreen ? "退出全屏" : "全屏"}</span>
        </button>
        <button className="fullscreen-toggle menu-settings" data-cursor="设置" onClick={() => setSettingsOpen(true)} aria-label="打开设置">
          <Settings2 /><span>设置</span>
        </button>
        <div className="scene-layer menu-scene" style={{ backgroundImage: `url(${images.auditorium})` }} />
        <div className="menu-shade" />
        <div className="menu-aurora" aria-hidden="true"><i /><i /><i /></div>
        <div className="menu-ribbons" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="watercolor-bloom bloom-one" />
        <div className="watercolor-bloom bloom-two" />
        <div className="watercolor-bloom bloom-three" />
        <div className="memory-frame" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="film-grain" />
        <div className="floating-dust">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ "--i": i } as CSSProperties} />)}</div>
        <aside className="menu-folio" aria-hidden="true">
          <span>MEMORY ARCHIVE</span>
          <strong>001</strong>
          <i />
          <small>SEPTEMBER / SUMMER</small>
        </aside>
        <section className="main-menu">
          <div className="title-kicker"><span>A HEARTBREAK SIMULATOR</span><i />特别篇 · 00</div>
          <div className="game-logo" aria-label="淡紫色">
            <div className="english-logo"><span>LAVENDER,</span><strong>STILL</strong></div>
            <em className="chinese-seal"><span>淡</span><span>紫</span><span>色</span></em>
            <i className="logo-swash" aria-hidden="true" />
            <b>THE COLOUR MEMORY KEPT</b>
          </div>
          <p className="menu-copy"><i>“</i> 有些记忆没有答案。<br />但你可以决定，要带着它走向哪里。</p>
          <div className="hand-note" aria-hidden="true">第一次看见她，是右前方三排。</div>
          <div className="menu-actions">
            <button data-cursor="进入" className="menu-primary" disabled={launching} onClick={() => startGame(0)}>
              <span className="button-index">01</span><span>开始故事</span><i /><Play />
            </button>
            {savedBeat > 0 && <button data-cursor="继续" className="menu-secondary" disabled={launching} onClick={() => startGame(savedBeat)}>
              <span className="button-index">02</span><span>继续记忆</span><i /><small>{Math.round((savedBeat / sequence.length) * 100)}%</small>
            </button>}
          </div>
          <div className="menu-memory-mark" aria-hidden="true"><i /><i /><i /><span>09 / 01</span></div>
        </section>
        {launching && (
          <div className="time-tunnel" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => <i key={index} style={{ "--i": index } as CSSProperties} />)}
            <span />
            <strong>MEMORY / 01</strong>
          </div>
        )}
        {settingsOpen && <SettingsPanel masterVolume={masterVolume} setMasterVolume={setMasterVolume} musicVolume={musicVolume} setMusicVolume={setMusicVolume} ambienceVolume={ambienceVolume} setAmbienceVolume={setAmbienceVolume} sfxVolume={sfxVolume} setSfxVolume={setSfxVolume} textSpeed={textSpeed} setTextSpeed={setTextSpeed} controllerConnected={controllerConnected} onClose={() => setSettingsOpen(false)} />}
      </main>
    );
  }

  if (finished) {
    const healedEnding = endingRoute === "healed";
    return (
      <main className={`game-shell ending-shell ${healedEnding ? "ending-healed" : "ending-stayed"}`} data-cursor="回忆">
        <MemoryCursor />
        <button className="fullscreen-toggle ending-fullscreen" data-cursor="全屏" onClick={toggleFullscreen} aria-label={isFullscreen ? "退出全屏" : "进入全屏"}>
          {isFullscreen ? <Minimize2 /> : <Maximize2 />}<span>{isFullscreen ? "退出全屏" : "全屏"}</span>
        </button>
        <div className="ending-path" style={{ backgroundImage: `url(${healedEnding ? images.studio : images.night})` }} />
        <div className="ending-veil" />
        <div className="film-grain" />
        <section className="ending-copy">
          <p>特别篇 · 淡紫色</p>
          <h1>{healedEnding ? "天亮了。" : "灯没有关。"}</h1>
          <h2>{healedEnding ? "这一次，我要去过自己的夏天。" : "生活走到了后来，心还留在那年。"}</h2>
          <div className="ending-line" />
          <div className="ending-sequence">
            {healedEnding ? <><p>淡紫色，我还是记得。</p><p>只是再想起你时，我先想起的不再是失去。</p><p>是那个十七岁的我，也曾那样认真地喜欢过一个人。</p></> : <><p>我没有再去打扰你。</p><p>却仍在每一个失眠的夜里，替那个回头寻找解释。</p><p>原来不联系一个人，也可能一直没有真正离开。</p></>}
          </div>
          <p className="ending-body">{healedEnding ? <><span>谢谢你来过。</span><br />也谢谢我，没有因为没被选择，就否定当年的真心。</> : <>这不是对你的惩罚，也不是一句“坏结局”。<br />只是提醒你：时间会经过一个人，却不能替一个人完成告别。</>}</p>
          <strong className="ending-release">{healedEnding ? <>故事没有变成爱情。<br />但我的人生，终于重新变成了我的故事。</> : <>如果今天还走不出去，也没有关系。<br />书页还在那里。你随时可以再试一次。</>}</strong>
          <div className="ending-actions">
            {healedEnding && <button data-cursor="打开" onClick={() => setGalleryOpen(true)}><Images /> 回看记忆 · 9/9</button>}
            {!healedEnding && <button data-cursor="返回" onClick={returnToEndingChoice}><BookOpen /> 回到那一页</button>}
            <button data-cursor="重来" onClick={() => startGame(0)}><RotateCcw /> 重新开始</button>
          </div>
        </section>
        {galleryOpen && (
          <div className="gallery-modal" role="dialog" aria-modal="true" aria-label="记忆相册">
            <button data-cursor="关闭" className="gallery-close" onClick={() => setGalleryOpen(false)}>关闭</button>
            <div className="gallery-hero" style={{ backgroundImage: `url(${gallery[galleryIndex][1]})` }} />
            <div className="gallery-strip">
              {gallery.map(([label, src], index) => (
                <button data-cursor="查看" key={label} className={index === galleryIndex ? "active" : ""} onClick={() => setGalleryIndex(index)}>
                  <img src={src} alt="" /><span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main
      ref={stageRef}
      className={`game-shell story-shell mood-${beat.mood || "quiet"} scene-${beat.image} interaction-${beat.interaction || "none"}`}
      style={{
        "--focus": focus,
        "--walk": hold,
        "--walk-scale": (1.04 + hold * .00165).toFixed(3),
        "--walk-y": `${(hold * .055).toFixed(2)}px`,
        "--walk-light": (.28 + hold * .0036).toFixed(2),
      } as CSSProperties}
      data-cursor={beat.kind === "dialogue" ? (typing ? "显示" : "继续") : undefined}
      onPointerMove={onPointerMove}
      onClick={onStageClick}
    >
      <MemoryCursor />
      <div key={`back-${beat.image}`} className="scene-layer scene-back" style={sceneStyle} />
      <div key={`front-${beat.image}`} className="scene-layer scene-front scene-enter" style={sceneStyle} />
      <div className="cg-cinematography" aria-hidden="true">
        <i className="cg-lens-breath" /><i className="cg-foreground-depth" /><i className="cg-focus-pull" />
      </div>
      <div className="dynamic-light" />
      <div className="living-details" aria-hidden="true">
        <i className="wind-strand strand-one" /><i className="wind-strand strand-two" />
        <i className="character-blink heroine-blink" /><i className="character-blink hero-blink" />
        <i className="moving-leaves" /><i className="sun-glint" /><i className="curtain-motion" />
        <i className="phone-glow" /><i className="breath-shift" />
      </div>
      {((beat.image === "night" && (beat.speaker === "她" || beat.interaction === "qqchat")) || (beat.image === "stars" && beat.speaker === "她")) && (
        <DynamicHeroine smiling={Boolean(beat.text && /别这个表情|高兴|以后都见不到|星星|天很干净/.test(beat.text))} />
      )}
      <div className="scene-watercolor" aria-hidden="true" />
      <div key={`transition-${beat.image}`} className="scene-transition" aria-hidden="true" />
      {beat.mood === "rain" && <div className="rain">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ "--i": i } as CSSProperties} />)}</div>}
      {(beat.mood === "warm" || beat.mood === "summer") && <div className="floating-dust">{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ "--i": i } as CSSProperties} />)}</div>}
      <div className="film-grain" />
      <div className="memory-frame story-frame" aria-hidden="true"><i /><i /><i /><i /></div>
      <aside className="memory-spine" aria-hidden="true">
        <span>{String(beatIndex + 1).padStart(2, "0")}</span>
        <i />
        <small>MEMORY<br />FRAGMENT</small>
      </aside>

      <header className="game-hud" onClick={(event) => event.stopPropagation()}>
        <div className="chapter-info">
          <span>{beat.chapter}</span>
          <small>{beat.date}</small>
        </div>
        <div className="hud-controls">
          <span className="score-status">{soundOn ? "♫ 配乐中" : "静音"}</span>
          <button data-cursor="声音" onClick={toggleSound} aria-label={soundOn ? "关闭声音" : "开启声音"}>{soundOn ? <Volume2 /> : <VolumeX />}</button>
          <button data-cursor="自动" className={auto ? "active" : ""} onClick={() => setAuto((value) => !value)} aria-label="自动播放">{auto ? <Pause /> : <Play />}<span>自动</span></button>
          <button data-cursor="快进" onClick={() => { setTyped(beat.text || ""); setTyping(false); }} aria-label="快速显示文字"><FastForward /></button>
          <button data-cursor="设置" onClick={() => { openPause(); setSettingsOpen(true); }} aria-label="声音与文字设置"><Settings2 /></button>
          <button data-cursor="暂停" onClick={openPause} aria-label="暂停游戏"><CirclePause /><span>暂停</span></button>
          <button data-cursor="全屏" onClick={toggleFullscreen} aria-label={isFullscreen ? "退出全屏" : "进入全屏"}>{isFullscreen ? <Minimize2 /> : <Maximize2 />}</button>
        </div>
      </header>
      <div className="story-progress"><span style={{ width: `${progress}%` }} /></div>

      {beat.kind === "title" && (
        <section className="chapter-card">
          <div className="chapter-number">{String(sequence.slice(0, beatIndex + 1).filter((item) => item.kind === "title").length).padStart(2, "0")}</div>
          <p><i />{beat.chapter}<i /></p>
          <h1>{beat.title}</h1>
          <span>{beat.subtitle}</span>
          <small>MEMORY / LAVENDER</small>
        </section>
      )}

      {beat.kind === "dialogue" && (
        <section className={`dialogue-box ${innerMonologue ? "inner-monologue" : "spoken-dialogue"}`}>
          <div className="dialogue-meta">
            <span>{innerMonologue ? "内心独白" : beat.speaker}</span>
            <i />
            <small>{innerMonologue ? "INNER VOICE" : String(beatIndex + 1).padStart(3, "0")}</small>
          </div>
          <div className="dialogue-copy">
            <span className="opening-quote">“</span>
            <p>{typed}<i className={typing ? "typing-caret" : ""} /></p>
          </div>
          {!typing && <span className="continue-pulse"><ChevronRight /></span>}
          <i className="dialogue-fold" aria-hidden="true" />
        </section>
      )}

      {beat.kind === "interaction" && (
        <InteractionPanel
          beat={beat}
          deskDistance={deskDistance}
          setDeskDistance={setDeskDistance}
          focus={focus}
          setFocus={setFocus}
          draft={draft}
          qqStep={qqStep}
          setQqStep={setQqStep}
          loopStep={loopStep}
          setLoopStep={setLoopStep}
          evidence={evidence}
          setEvidence={setEvidence}
          hold={hold}
          lookbacks={lookbacks}
          setLookbacks={setLookbacks}
          keepsakeChoice={keepsakeChoice}
          setKeepsakeChoice={setKeepsakeChoice}
          advance={advance}
          tone={tone}
          foley={foley}
          startDelete={startDelete}
          stopDelete={stopDelete}
          startHold={startHold}
          stopHold={stopHold}
          chooseEnding={chooseEnding}
          breathingMoment={breathingMoment}
          playBreathingMoment={playBreathingMoment}
          examStep={examStep}
          examStats={examStats}
          examLog={examLog}
          makeExamChoice={makeExamChoice}
          rebuildChoices={rebuildChoices}
          setRebuildChoices={setRebuildChoices}
        />
      )}

      {paused && (
        <section className="pause-overlay" role="dialog" aria-modal="true" aria-label="暂停菜单" onClick={(event) => event.stopPropagation()}>
          <div className="pause-veil" />
          {settingsOpen ? <SettingsPanel masterVolume={masterVolume} setMasterVolume={setMasterVolume} musicVolume={musicVolume} setMusicVolume={setMusicVolume} ambienceVolume={ambienceVolume} setAmbienceVolume={setAmbienceVolume} sfxVolume={sfxVolume} setSfxVolume={setSfxVolume} textSpeed={textSpeed} setTextSpeed={setTextSpeed} controllerConnected={controllerConnected} onClose={() => setSettingsOpen(false)} /> : <div className="pause-panel">
            <header>
              <div><small>MEMORY ARCHIVE</small><h2>暂停</h2><p>{beat.chapter} · {beat.date}</p></div>
              <button data-cursor="继续" onClick={() => setPaused(false)} aria-label="继续游戏"><X /></button>
            </header>
            <div className="pause-actions">
              <button className="pause-primary" onClick={() => setPaused(false)}><Play /><span><b>继续游戏</b><small>回到这一刻</small></span></button>
              <button disabled={beatIndex === 0} onClick={previousBeat}><SkipBack /><span><b>上一张</b><small>退回前一段记忆</small></span></button>
              <button onClick={() => setSettingsOpen(true)}><Settings2 /><span><b>声音与文字</b><small>分层音量、字幕速度</small></span></button>
              <button onClick={returnToTitle}><Home /><span><b>回到标题</b><small>进度会保留</small></span></button>
              <button onClick={exitSession}><LogOut /><span><b>退出本次游玩</b><small>退出全屏并保留存档</small></span></button>
            </div>
            <div className="save-slots">
              <div className="save-slots-title"><span>SAVE SLOTS</span><small>自动存档之外，可以留下三个书签</small></div>
              <div>
                {saveSlots.map((saved, index) => (
                  <article key={index}>
                    <button disabled={saved === null || saved >= sequence.length} onClick={() => loadSaveSlot(index)}><small>0{index + 1}</small><span>{saved === null ? "空书签" : sequence[saved]?.chapter || "另一条结局的书签"}</span><em>{saved === null ? "—" : `${Math.round(((saved + 1) / progressLength) * 100)}%`}</em></button>
                    <button onClick={() => writeSaveSlot(index)}>{saved === null ? "存入" : "覆盖"}</button>
                  </article>
                ))}
              </div>
            </div>
            <div className="memory-jump">
              <div className="memory-jump-title"><BookOpen /><span><b>记忆跳转</b><small>只能回到已经抵达的章节</small></span></div>
              <div className="memory-jump-grid">
                {sequence.map((item, index) => item.kind === "title" ? (
                  <button key={`${item.chapter}-${index}`} className={index === beatIndex ? "current" : ""} disabled={index > maxUnlocked} onClick={() => jumpToBeat(index)}>
                    <small>{String(sequence.slice(0, index + 1).filter((entry) => entry.kind === "title").length).padStart(2, "0")}</small>
                    <span><b>{item.title}</b><em>{item.date}</em></span>
                    {index > maxUnlocked ? <LockKeyhole /> : <i />}
                  </button>
                ) : null)}
              </div>
            </div>
            <footer><span>ESC</span> 继续游戏 <button onClick={toggleFullscreen}>{isFullscreen ? "退出全屏" : "进入全屏"}</button></footer>
          </div>}
        </section>
      )}

      <footer className="story-footer">
        <span>{progress}%</span>
        <span>{beat.kind === "dialogue" ? "点击画面继续" : "完成画面中的动作"}</span>
      </footer>
    </main>
  );
}

type SettingsPanelProps = {
  masterVolume: number;
  setMasterVolume: (value: number) => void;
  musicVolume: number;
  setMusicVolume: (value: number) => void;
  ambienceVolume: number;
  setAmbienceVolume: (value: number) => void;
  sfxVolume: number;
  setSfxVolume: (value: number) => void;
  textSpeed: number;
  setTextSpeed: (value: number) => void;
  controllerConnected: boolean;
  onClose: () => void;
};

function SettingsPanel(props: SettingsPanelProps) {
  const rows = [
    { key: "master", label: "总音量", note: "所有声音", icon: <Volume2 />, value: props.masterVolume, set: props.setMasterVolume },
    { key: "music", label: "主题旋律", note: "随情绪变奏", icon: <Music2 />, value: props.musicVolume, set: props.setMusicVolume },
    { key: "ambience", label: "环境声", note: "柔风、雨与房间", icon: <Wind />, value: props.ambienceVolume, set: props.setAmbienceVolume },
    { key: "sfx", label: "交互音效", note: "打字、快门与提示", icon: <Sparkles />, value: props.sfxVolume, set: props.setSfxVolume },
  ];
  return (
    <div className="settings-panel" onClick={(event) => event.stopPropagation()}>
      <header>
        <div><small>OPTIONS / ACCESSIBILITY</small><h2>声音与文字</h2><p>每一层声音都可以单独调整。</p></div>
        <button onClick={props.onClose} aria-label="关闭设置"><X /></button>
      </header>
      <div className="settings-rows">
        {rows.map((row) => (
          <label key={row.key}>
            <i>{row.icon}</i>
            <span><b>{row.label}</b><small>{row.note}</small></span>
            <input type="range" min="0" max="100" value={Math.round(row.value * 100)} onChange={(event) => row.set(Number(event.target.value) / 100)} />
            <em>{Math.round(row.value * 100)}</em>
          </label>
        ))}
        <label>
          <i><MessageCircle /></i>
          <span><b>字幕速度</b><small>逐字出现速度</small></span>
          <input type="range" min="0.65" max="1.8" step="0.05" value={props.textSpeed} onChange={(event) => props.setTextSpeed(Number(event.target.value))} />
          <em>{props.textSpeed.toFixed(2)}×</em>
        </label>
      </div>
      <div className={`controller-status ${props.controllerConnected ? "connected" : ""}`}>
        <Gamepad2 /><span><b>{props.controllerConnected ? "手柄已连接" : "支持手柄与键盘"}</b><small>A / Enter 继续 · Menu / Esc 暂停 · ← 返回上一段</small></span><i />
      </div>
      <button className="settings-done" onClick={props.onClose}>保存并返回</button>
    </div>
  );
}

type InteractionProps = {
  beat: Beat;
  deskDistance: number;
  setDeskDistance: (value: number) => void;
  focus: number;
  setFocus: (value: number) => void;
  draft: string;
  qqStep: number;
  setQqStep: (value: number) => void;
  loopStep: number;
  setLoopStep: (value: number) => void;
  evidence: string | null;
  setEvidence: (value: string) => void;
  hold: number;
  lookbacks: number;
  setLookbacks: (value: number) => void;
  keepsakeChoice: "keep" | "release" | null;
  setKeepsakeChoice: (value: "keep" | "release") => void;
  advance: () => void;
  tone: (frequency: number, duration: number, volume?: number) => void;
  foley: (kind: "page" | "shutter" | "message") => void;
  startDelete: () => void;
  stopDelete: () => void;
  startHold: () => void;
  stopHold: () => void;
  chooseEnding: (route: EndingRoute) => void;
  breathingMoment: boolean;
  playBreathingMoment: () => void;
  examStep: number;
  examStats: ExamStats;
  examLog: string[];
  makeExamChoice: (label: string, change: ExamStats) => void;
  rebuildChoices: string[];
  setRebuildChoices: (value: string[]) => void;
};

function DynamicHeroine({ smiling }: { smiling: boolean }) {
  return (
    <div className={`heroine-puppet ${smiling ? "is-smiling" : "is-neutral"}`} aria-hidden="true">
      <div className="puppet-presence" />
      <div className="puppet-rig">
        <img className="puppet-layer puppet-body" src={characterFrames.neutral} alt="" />
        <img className="puppet-layer puppet-smile" src={characterFrames.smile} alt="" />
        <img className="puppet-layer puppet-blink" src={characterFrames.closed} alt="" />
        <img className="puppet-layer puppet-hair-back" src={characterFrames.neutral} alt="" />
        <span className="puppet-rim" />
      </div>
    </div>
  );
}

function InteractionPanel(props: InteractionProps) {
  const { beat } = props;
  if (beat.interaction === "projector") {
    const released = props.focus >= 88;
    return (
      <section className={`interaction-card projector-interaction ${released ? "is-released" : ""}`} onClick={(event) => event.stopPropagation()}>
        <small>记忆幻灯机 · 片盒卡住</small>
        <div className="projector-window" style={{
          "--projector": props.focus / 100,
          "--projector-shift": `${-(props.focus / 100) * 82}px`,
          "--projector-scale": .55 + (props.focus / 100) * .45,
        } as CSSProperties} aria-hidden="true">
          <div className="projector-strip"><i /><i /><i /><i /></div>
          <span className="projector-light" />
          <b>{released ? "右前方 · 三排" : "那一格画面，还没有对准。"}</b>
        </div>
        <input aria-label="拨动记忆片盒" type="range" min="0" max="100" value={props.focus} onChange={(event) => props.setFocus(Number(event.target.value))} />
        {released ? (
          <button className="interaction-next" onClick={() => { props.tone(392, .7, .035); window.setTimeout(props.advance, 500); }}>让这束光回到那一年 <ChevronRight /></button>
        ) : <p>慢慢拨动卡住的片盒。不要替记忆补画面，只把它重新对准。</p>}
      </section>
    );
  }

  if (beat.interaction === "find") {
    return (
      <>
        <div className="interaction-caption"><small>记忆交互</small><p>在画面里，找到后来一直没有忘记的颜色。</p></div>
        <button className="hairtie-hotspot" onClick={(event) => { event.stopPropagation(); props.tone(760, .35, .045); window.setTimeout(props.advance, 650); }}>
          <i /><span>淡紫色</span>
        </button>
      </>
    );
  }

  if (beat.interaction === "desks") {
    const done = props.deskDistance >= 86;
    return (
      <section className="interaction-card paper-interaction" onClick={(event) => event.stopPropagation()}>
        <small>高一 · 课间留下的草稿纸</small>
        <div className="paper-stage" style={{ "--paper-open": props.deskDistance / 100 } as CSSProperties}>
          <div className="shared-paper">
            <span className="paper-date">物理 · 随堂练习</span>
            <i className="paper-line line-one" /><i className="paper-line line-two" /><i className="paper-line line-three" />
            <b>条件看反了。</b>
            <em>你每次都会先皱一下眉。</em>
            <span className="paper-fold" />
          </div>
          <div className="pencil-shadow" />
        </div>
        <input aria-label="展开草稿纸" type="range" min="0" max="100" value={props.deskDistance} onChange={(event) => props.setDeskDistance(Number(event.target.value))} />
        {done ? <button className="interaction-next" onClick={props.advance}>看完，把纸轻轻推回去 <ChevronRight /></button> : <p>沿着折角，慢慢展开她推过来的草稿纸。</p>}
      </section>
    );
  }

  if (beat.interaction === "endingchoice") {
    return (
      <section className="interaction-card ending-choice" onClick={(event) => event.stopPropagation()}>
        <small>书页停在这里</small>
        <h2>“没有结论的故事，也可以由我决定在哪里停笔。”</h2>
        <p>理解这句话，不等于立刻做到。此刻的你，想把手伸向哪里？</p>
        <div className="ending-choice-options">
          <button onClick={() => props.chooseEnding("healed")}><span>把书翻到下一页</span><small>允许答案慢慢回到自己身上</small><ChevronRight /></button>
          <button className="stay-choice" onClick={() => props.chooseEnding("stayed")}><span>还是打开聊天记录</span><small>再确认一次，她是否真的离开</small><ChevronRight /></button>
        </div>
      </section>
    );
  }

  if (beat.interaction === "photo") {
    const done = props.focus >= 84;
    return (
      <section className="interaction-card photo-interaction" onClick={(event) => event.stopPropagation()}>
        <small>合照 · 别站得那么远</small>
        <div className="photo-pair" style={{ gap: `${Math.max(10, (100 - props.focus) * .72)}px` }}>
          <span className="pair-me">我</span><i /><span className="pair-her">她</span>
        </div>
        <input aria-label="走进合照" type="range" min="0" max="100" value={props.focus} onChange={(event) => props.setFocus(Number(event.target.value))} />
        {done ? (
          <button className="shutter-button" onClick={() => { props.foley("shutter"); window.setTimeout(() => props.tone(390, .24, .038), 90); window.setTimeout(props.advance, 650); }}>站好，等同学按下快门</button>
        ) : <p>向她那边靠近一点。拍照的人不在画面里，你们两个都在。</p>}
      </section>
    );
  }

  if (beat.interaction === "qqchat") {
    const reveal = (next: number, frequency = 720) => {
      if (next === 1 || next === 4) props.foley("message");
      else props.tone(frequency, .09, .042);
      props.setQqStep(next);
    };
    return (
      <section className="qq-memory" onClick={(event) => event.stopPropagation()}>
        <header className="qq-titlebar">
          <div className="qq-mark"><span>Q</span><i /></div>
          <div><strong>她</strong><small>手机在线 · 远方</small></div>
          <b>—　□　×</b>
        </header>
        <div className="qq-body">
          <aside className="qq-contacts" aria-hidden="true">
            <span className="qq-self">我</span>
            <i className="active">她</i><i>班</i><i>友</i>
          </aside>
          <div className="qq-conversation">
            <div className="qq-date"><i />转学后的第六周 · 星期六<i /></div>
            <time>01:03</time>
            <div className="qq-bubble incoming"><span>她</span><p>今天有点累。</p></div>
            {props.qqStep >= 1 && <div className="qq-bubble incoming second"><span>她</span><p>不过没事，睡一觉就好了。</p></div>}
            {props.qqStep >= 3 && <div className="qq-bubble outgoing"><span>我</span><p>早点睡，明天会好一点。</p></div>}
            {props.qqStep === 3 && <div className="qq-typing"><i /><i /><i /></div>}
            {props.qqStep >= 4 && <div className="qq-bubble incoming final"><span>她</span><p>嗯，你也是。</p></div>}
          </div>
        </div>
        <footer className="qq-composer">
          {props.qqStep === 0 && <button onClick={() => reveal(1)}>查看下一条消息 <ChevronRight /></button>}
          {props.qqStep === 1 && <button onClick={() => reveal(2, 420)}>把想说的话写下来 <ChevronRight /></button>}
          {props.qqStep === 2 && (
            <>
              <div className="qq-draft">{props.draft || <span>输入消息…</span>}<i /></div>
              {props.draft ? (
                <button className="qq-delete" onPointerDown={props.startDelete} onPointerUp={props.stopDelete} onPointerLeave={props.stopDelete}>按住退格，删掉这句话</button>
              ) : <button onClick={() => reveal(3, 880)}>发送“早点睡，明天会好一点”</button>}
            </>
          )}
          {props.qqStep === 3 && <button onClick={() => reveal(4, 960)}>等她的回复 <ChevronRight /></button>}
          {props.qqStep >= 4 && <button onClick={props.advance}>让屏幕慢慢暗下去 <ChevronRight /></button>}
        </footer>
      </section>
    );
  }

  if (beat.interaction === "evidence") {
    return (
      <section className="interaction-card evidence-interaction" onClick={(event) => event.stopPropagation()}>
        <small>记忆证据 #07</small>
        <h2>楼梯上的回头</h2>
        <p>已知：你回头时，她也正好回头。<br />未知：这件事究竟意味着什么。</p>
        {!props.evidence ? (
          <div className="evidence-options">
            {["她也喜欢我", "她在意我", "只是下意识", "无法判断"].map((choice) => <button key={choice} onClick={() => props.setEvidence(choice)}>{choice}</button>)}
          </div>
        ) : (
          <div className="evidence-reveal">
            <blockquote>“{props.evidence}。”</blockquote>
            <p>这是你当时选择相信的答案。<br />记忆是真的，心动是真的；解释，不一定只有一种。</p>
            <button className="interaction-next" onClick={props.advance}>收起证据 <ChevronRight /></button>
          </div>
        )}
      </section>
    );
  }

  if (beat.interaction === "tremble") {
    return (
      <section className="interaction-card tremble-interaction" onClick={(event) => event.stopPropagation()}>
        <small>01:28 · 未发送</small>
        <div className={`tremble-phone ${props.hold >= 100 ? "is-steady" : ""}`}>
          <header><span>她</span><i>手机在线</i></header>
          <div className="tremble-copy">我想问你，楼梯上回头的那一秒到底算什么。是不是我哪里做错了，还是你只是害怕……</div>
          <footer><b>{Math.max(0, 317 - Math.round(props.hold * 3.17))}</b> 字</footer>
        </div>
        <p>{props.hold < 100 ? "手在抖，呼吸也乱了。按住，让这条消息慢慢停下来。" : "手停下来了。不是因为不想问，而是今晚不必把答案逼出来。"}</p>
        <button
          className={`hold-button ${props.hold >= 100 ? "complete" : ""}`}
          style={{ "--hold": `${props.hold}%` } as CSSProperties}
          onPointerDown={props.startHold}
          onPointerUp={props.stopHold}
          onPointerLeave={props.stopHold}
        >
          {props.hold < 100 ? "按住 · 稳住呼吸" : "没有发送"}
        </button>
        {props.hold >= 100 && <button className="interaction-next" onClick={props.advance}>把手机放下 <ChevronRight /></button>}
      </section>
    );
  }

  if (beat.interaction === "examplan") {
    const nights = [
      { day: "距离高考 42 天", prompt: "凌晨一点，理综错题还剩六页。", choices: [
        ["合上卷子，睡够六小时", { focus: 5, sleep: 16, anxiety: -10 }],
        ["继续刷题到困得睁不开眼", { focus: 9, sleep: -15, anxiety: 9 }],
      ] },
      { day: "距离高考 36 天", prompt: "QQ 提示音亮了一下，但不是她。", choices: [
        ["把手机交给同桌保管一节课", { focus: 14, sleep: 2, anxiety: -5 }],
        ["再翻一次聊天记录", { focus: -9, sleep: -5, anxiety: 13 }],
      ] },
      { day: "距离高考 17 天", prompt: "模考退步，胸口像压着一块石头。", choices: [
        ["去走廊喝水，回来只订正三题", { focus: 10, sleep: 3, anxiety: -12 }],
        ["逼自己立刻做完一整套卷子", { focus: 7, sleep: -8, anxiety: 10 }],
      ] },
      { day: "距离高考 7 天", prompt: "她和前途同时出现在脑海里。", choices: [
        ["承认舍不得，然后继续复习", { focus: 13, sleep: 5, anxiety: -9 }],
        ["要求今晚必须彻底想明白", { focus: -7, sleep: -11, anxiety: 16 }],
      ] },
    ] as const;
    const current = nights[Math.min(props.examStep, nights.length - 1)];
    const finished = props.examStep >= nights.length;
    return (
      <section className="interaction-card exam-interaction" onClick={(event) => event.stopPropagation()}>
        <div className="exam-header"><small>GAOKAO / 42 DAYS</small><b><BrainCircuit />双重压力</b></div>
        <div className="exam-stats">
          <span><i style={{ "--meter": `${props.examStats.focus}%` } as CSSProperties} /><b>{props.examStats.focus}</b><small>专注</small></span>
          <span><i style={{ "--meter": `${props.examStats.sleep}%` } as CSSProperties} /><b>{props.examStats.sleep}</b><small>睡眠</small></span>
          <span className="anxiety"><i style={{ "--meter": `${props.examStats.anxiety}%` } as CSSProperties} /><b>{props.examStats.anxiety}</b><small>焦虑</small></span>
        </div>
        {!finished ? <>
          <div className="exam-night"><time>{current.day}</time><p>{current.prompt}</p></div>
          <div className="exam-options">
            {current.choices.map(([label, change]) => <button key={label} onClick={() => props.makeExamChoice(label, change)}>{label}<ChevronRight /></button>)}
          </div>
        </> : <div className="exam-result">
          <p>{props.examStats.focus >= 70 && props.examStats.anxiety < 80 ? "你没有突然变得坚强。你只是学会把今天切成可以完成的一小格。" : "你还是熬过了几个失控的夜晚。可在最后七天，你终于不再要求自己同时解开两道人生题。"}</p>
          <div>{props.examLog.map((item, index) => <span key={`${item}-${index}`}><small>0{index + 1}</small>{item}</span>)}</div>
          <button className="interaction-next" onClick={props.advance}>把准考证收进书包 <ChevronRight /></button>
        </div>}
      </section>
    );
  }

  if (beat.interaction === "loop") {
    const thoughts = ["她回头了，所以一定喜欢过我", "她只是害怕，不是真的想结束", "等高考结束，一切也许会改变", "再翻一次记录，也许能找到证据"];
    return (
      <section className="interaction-card loop-interaction" onClick={(event) => event.stopPropagation()}>
        <small>思绪循环 · {String(Math.min(props.loopStep + 1, 4)).padStart(2, "0")}/04</small>
        <div className="thought-orbit">
          <i /><i /><i />
          <strong>{props.loopStep < thoughts.length ? thoughts[props.loopStep] : "又回到了起点"}</strong>
        </div>
        {props.loopStep < thoughts.length ? (
          <button className="interaction-next" onClick={() => { props.tone(188 - props.loopStep * 12, .22, .055); props.setLoopStep(props.loopStep + 1); }}>再想一遍 <ChevronRight /></button>
        ) : (
          <div className="loop-answer">
            <p>它们都能让我多等一天，却没有一种解释能替她改变决定。</p>
            <button className="interaction-next" onClick={props.advance}>从循环里退出 <ChevronRight /></button>
          </div>
        )}
      </section>
    );
  }

  if (beat.interaction === "rebuild") {
    const rituals = [
      { key: "read", label: "读完十页", note: "不是为了忘记，只把注意力借给今天", icon: <BookOpen /> },
      { key: "walk", label: "走两圈操场", note: "让身体替大脑把夜晚送过去", icon: <Footprints /> },
      { key: "friend", label: "回复朋友", note: "重新进入仍在发生的生活", icon: <MessageCircle /> },
      { key: "create", label: "写下一小段旋律", note: "不再只替她写，也开始替自己写", icon: <Music2 /> },
    ];
    const complete = props.rebuildChoices.length >= 3;
    return (
      <section className="interaction-card rebuild-interaction" onClick={(event) => event.stopPropagation()}>
        <small>重建不是一条直线</small>
        <h2>这一周，只照顾三个很小的今天。</h2>
        <div className="rebuild-grid">
          {rituals.map((ritual) => {
            const selected = props.rebuildChoices.includes(ritual.key);
            return <button key={ritual.key} className={selected ? "selected" : ""} disabled={selected || complete} onClick={() => { props.tone(ritual.key === "create" ? 523.25 : 392, .34, .032); props.setRebuildChoices([...props.rebuildChoices, ritual.key]); }}>
              <i>{ritual.icon}</i><span><b>{ritual.label}</b><small>{ritual.note}</small></span>{selected && <Sparkles />}
            </button>;
          })}
        </div>
        <p>{complete ? "没有一件事让你立刻好起来。可这一周，终于有三件事与她无关。" : `还可以选择 ${3 - props.rebuildChoices.length} 件。`}</p>
        {complete && <button className="interaction-next" onClick={props.advance}>让日历往后翻一周 <ChevronRight /></button>}
      </section>
    );
  }

  if (beat.interaction === "reframe") {
    const released = props.focus >= 86;
    return (
      <section className={`interaction-card reframe-interaction ${released ? "released" : ""}`} onClick={(event) => event.stopPropagation()}>
        <small>再次查看 · 证据 #07</small>
        <div className="reframe-cards" style={{ "--reframe": props.focus / 100 } as CSSProperties}>
          <blockquote><span>当时的解释</span><b>“{props.evidence || "她也喜欢我"}。”</b><p>只要这个解释成立，故事就还没有真正结束。</p></blockquote>
          <blockquote><span>现在保留的事实</span><b>“她回头了。我也回头了。”</b><p>那一刻是真的。至于它意味着什么，我不再需要替两个人作答。</p></blockquote>
        </div>
        <input aria-label="从解释回到事实" type="range" min="0" max="100" value={props.focus} onChange={(event) => props.setFocus(Number(event.target.value))} />
        {!released ? <p>慢慢把“解释”推开，只留下确实发生过的事。</p> : <button className="interaction-next" onClick={props.advance}>把证据改名为“记忆” <ChevronRight /></button>}
      </section>
    );
  }

  if (beat.interaction === "walk") {
    return (
      <section className="interaction-card walk-interaction" onClick={(event) => event.stopPropagation()}>
        <small>她正在跑远</small>
        <p>{props.hold < 100 ? "按住 W 键，或按住下方按钮，试着向前一步。" : "你终于迈开脚步。不是追上她，是离开原地。"}</p>
        <button
          className={`hold-button ${props.hold >= 100 ? "complete" : ""}`}
          style={{ "--hold": `${props.hold}%` } as CSSProperties}
          onPointerDown={props.startHold}
          onPointerUp={props.stopHold}
          onPointerLeave={props.stopHold}
        >
          {props.hold < 100 ? "按住 W · 向前" : "脚步落下"}
        </button>
        {props.hold >= 100 && <button className="interaction-next" onClick={props.advance}>继续 <ChevronRight /></button>}
      </section>
    );
  }

  if (beat.interaction === "closechat") {
    return (
      <section className="interaction-card closechat-interaction" onClick={(event) => event.stopPropagation()}>
        <small>把夜晚还给自己</small>
        <div className={`phone-memory ${props.hold >= 100 ? "is-dark" : ""}`}>
          <span>02:47</span>
          <p>“也许再往前翻一点，就能找到答案。”</p>
          <i />
        </div>
        <p>{props.hold < 100 ? "按住，让这块屏幕先安静下来。" : "没有新的消息。也不需要再有了。"}</p>
        <button
          className={`hold-button ${props.hold >= 100 ? "complete" : ""}`}
          style={{ "--hold": `${props.hold}%` } as CSSProperties}
          onPointerDown={props.startHold}
          onPointerUp={props.stopHold}
          onPointerLeave={props.stopHold}
        >
          {props.hold < 100 ? "按住 · 熄灭屏幕" : "屏幕已经暗了"}
        </button>
        {props.hold >= 100 && <button className={`interaction-next ${props.breathingMoment ? "is-listening" : ""}`} disabled={props.breathingMoment} onClick={props.playBreathingMoment}>{props.breathingMoment ? "正在听自己的呼吸……" : "听一会儿自己的呼吸"} {!props.breathingMoment && <ChevronRight />}</button>}
      </section>
    );
  }

  if (beat.interaction === "keepsake") {
    return (
      <section className="interaction-card keepsake-interaction" onClick={(event) => event.stopPropagation()}>
        <small>整理旧物</small>
        <div className="keepsake-photo" aria-hidden="true">
          <span>高一 · 九月</span>
          <i />
          <b>淡紫色</b>
        </div>
        {!props.keepsakeChoice ? (
          <>
            <h2>照片里的那根头绳还在。</h2>
            <p>你不需要用某一个动作，证明自己已经放下。</p>
            <div className="keepsake-options">
              <button onClick={() => props.setKeepsakeChoice("keep")}>收进盒子里</button>
              <button onClick={() => props.setKeepsakeChoice("release")}>删掉这张照片</button>
            </div>
          </>
        ) : (
          <div className="keepsake-answer">
            <p>{props.keepsakeChoice === "keep" ? "你把照片放进盒底。留下纪念，不等于留在过去。" : "你删掉了照片。有些事，不需要靠物品证明发生过。"}</p>
            <strong>这是你的选择。两种都不是失败。</strong>
            <button className="interaction-next" onClick={props.advance}>合上盒子 <ChevronRight /></button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="interaction-card lookback-interaction" onClick={(event) => event.stopPropagation()}>
      <small>最后一次交互</small>
      {props.lookbacks < 2 ? (
        <>
          <p>{props.lookbacks === 0 ? "走出几步以后，一个熟悉的冲动又出现了。" : "树叶在动。她已经不在那里。"}</p>
          <button className="round-lookback" onClick={() => { props.tone(120, .35, .055); props.setLookbacks(props.lookbacks + 1); }}>回头</button>
        </>
      ) : (
        <>
          <p>按钮第三次出现。<br />这一次，你还需要确认吗？</p>
          <div className="final-options">
            <button onClick={props.advance}>不再确认，继续走</button>
            <button className="faint" onClick={() => props.setLookbacks(props.lookbacks + 1)}>再看一次</button>
          </div>
          {props.lookbacks > 2 && <span>没关系。治愈不是考试，你可以按自己的速度来。</span>}
        </>
      )}
    </section>
  );
}

function MemoryCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (event: PointerEvent) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      cursorRef.current.classList.add("is-visible");
    };

    const over = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest<HTMLElement>("[data-cursor], button, input");
      const label = interactive?.dataset.cursor || (interactive?.matches("button, input") ? "选择" : "");
      cursorRef.current?.classList.toggle("is-active", Boolean(interactive));
      if (labelRef.current) labelRef.current.textContent = label;
    };

    const leave = () => cursorRef.current?.classList.add("is-hidden");
    const enter = () => cursorRef.current?.classList.remove("is-hidden");

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    document.documentElement.addEventListener("mouseleave", leave);
    document.documentElement.addEventListener("mouseenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.removeEventListener("mouseenter", enter);
    };
  }, []);

  return (
    <div className="memory-cursor" aria-hidden="true">
      <div ref={cursorRef} className="cursor-heart">
        <span className="cursor-heart-halo" />
        <Heart className="cursor-heart-core" fill="currentColor" strokeWidth={1.7} />
        <i className="cursor-heart-glint" />
        <em ref={labelRef} />
      </div>
    </div>
  );
}
