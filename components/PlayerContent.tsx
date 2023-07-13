"use client";

// npm i use-sound

import { Song } from "@/types";
import LikeButton from "./LikeButton";
import MediaItem from "./MediaItem";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import Slider from "./Slider";
import usePlayer from "@/hooks/usePlayer";
import { useEffect, useState } from "react";
import useSound from "use-sound";

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currTime, setCurrTime] = useState<{ min: number; sec: number }>({
    min: 0,
    sec: 0,
  }); // posição do audio em minutos e segundos

  const [fullTime, setFullTime] = useState<{ min: number; sec: number }>({
    min: 0,
    sec: 0,
  });

  const [seconds, setSeconds] = useState<number>(0); // current position of the audio in seconds

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  const onPlayNext = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const nextSong = player.ids[currentIndex + 1];

    if (!nextSong) {
      return player.setId(player.ids[0]);
    }

    player.setId(nextSong);
  };

  const [play, { pause, duration, sound }] = useSound(songUrl, {
    volume: volume,
    onplay: () => setIsPlaying(true),
    onend: () => {
      setIsPlaying(false);
      onPlayNext();
    },
    onpause: () => setIsPlaying(false),
    format: ["mp3"],
  });

  useEffect(() => {
    sound?.play();

    return () => {
      sound?.unload();
    };
  }, [sound]);

  const handlePlay = () => {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  };

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  };

  useEffect(() => {
    if (duration) {
      const sec = duration / 1000;
      const min = Math.floor(sec / 60);
      const secRemain = Math.floor(sec % 60);
      setFullTime({
        min: min,
        sec: secRemain,
      });
    }
  }, [sound]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sound) {
        setSeconds(sound.seek([])); // setting the seconds state with the current state
        const min = Math.floor(sound.seek([]) / 60);
        const sec = Math.floor(sound.seek([]) % 60);
        setCurrTime({
          min,
          sec,
        });
      }
    }, 250);
    return () => clearInterval(interval);
  }, [sound]);

  const onPlayPrevious = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const PreviousSong = player.ids[currentIndex - 1];

    if (!PreviousSong) {
      return player.setId(player.ids[player.ids.length - 1]);
    }

    player.setId(PreviousSong);
  };

  return (
    <div
      className="
            grid
            grid-cols-2
            md:grid-cols-3
            h-full
        "
    >
      <div
        className="
            flex
            w-full
            justify-start
        "
      >
        <div className="flex itemcs-center gap-x-4">
          <MediaItem data={song} />
          <LikeButton songId={song.id} />
        </div>
      </div>

      <div className="flex md:hidden col-auto w-full justify-end items-center">
        <div
          onClick={handlePlay}
          className="
            h-10
            w-10
            flex
            items-center
            justify-center
            rounded-full
            bg-white
            p-1
            cursor-pointer
            "
        >
          <Icon size={30} className="text-black" />
        </div>
      </div>
      {/* Botões */}
      <div className="h-full w-full">
        <div
          className="
            hidden
            md:flex
            justify-center
            items-center
            w-full
            max-w-[722px]
            gap-x-6
        "
        >
          <AiFillStepBackward
            size={30}
            onClick={onPlayPrevious}
            className="
            text-neutral-400
            cursor-pointer
            hover:text-white
            transition
            "
          />
          <div
            onClick={handlePlay}
            className="
                flex
                items-center
                justify-center
                h-10
                w-10
                rounded-full
                bg-white
                p-1
                cursor-pointer
            "
          >
            <Icon className="text-black" size={30} />
          </div>

          <AiFillStepForward
            size={30}
            onClick={onPlayNext}
            className="
                    text-neutral-400
                    cursor-pointer
                    hover:text-white
                    transition
                    "
          />
        </div>
        <div className="w-9/12 bottom-0 left-1/2 translate-x-[-50%] absolute flex gap-1 items-center justify-center md:relative md:w-full md:translate-x-0 md:left-0">
          <p className="text-gray-400 text-sm">
            {currTime.min}:{currTime.sec}
          </p>
          <input
            type="range"
            min="0"
            max={duration ? duration / 1000 : 0}
            value={seconds}
            onChange={(e) => {
              sound.seek([e.target.value]);
            }}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer"
          />

          <p className="text-gray-400 text-sm">
            {fullTime.min}:{fullTime.sec}
          </p>
        </div>
      </div>

      <div
        className="
            hidden
            md:flex
            w-full
            justify-end
            pr-2
        "
      >
        <div className="flex items-center gap-x-2 w-[120px]">
          <VolumeIcon
            onClick={toggleMute}
            className="cursor-pointer"
            size={34}
          />
          <Slider value={volume} onChange={(value) => setVolume(value)} />
        </div>
      </div>
    </div>
  );
};

export default PlayerContent;
