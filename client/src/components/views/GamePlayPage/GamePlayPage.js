import "./GamePlayPage.css";
import "./GamePlaySlider.css";
import GameCharacterBlock from "./GameCharacterBlock";
import { TextBlock, TextBlockChoice } from "./TextBlock.js";
import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "axios";
import HistoryMapPopup from "./HistoryMap";
import LoadingPage from "./LoadingPage";
import { message } from "antd";
import { socket } from "../../App"
import { loadEmptyNum, savePrevScene } from "../../../_actions/sync_actions"
import useKey from "../../functions/useKey";
import { gameLoadingPage } from "../../../_actions/gamePlay_actions";
import { navbarControl, footerControl } from "../../../_actions/controlPage_actions";
import useFullscreenStatus from "../../../utils/useFullscreenStatus";
import { useLocation } from "react-router";
import TreeMapPopup from "./TreeMap";
import { gamePause } from "../../../_actions/gamePlay_actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Complaint from './Complaint.js';
import { faCheckSquare, faCompress, faExpand, } from "@fortawesome/free-solid-svg-icons";
import LogPopup from "./LogPopup";

//! gamedetail
// import { Link } from "react-router-dom";
// import { faEye, faHeart, faLink } from "@fortawesome/free-solid-svg-icons";
// import GameForkButton from "../GameDetailPage/GameForkButton";
// import Comment from '../Comment/Comment.js';

const bgm_audio = new Audio();
bgm_audio.volume = 0.5
const sound_audio = new Audio();
sound_audio.volume = 0.5

function useConstructor(callBack = () => { }) {
  const [hasBeenCalled, setHasBeenCalled] = useState(false);
  if (hasBeenCalled) return;
  callBack();
  setHasBeenCalled(true);
}

//! playscreen
const ProductScreen = (props) => {

  const isMobile = useRef(false);
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) {
    isMobile.current = true;
  }
  useLayoutEffect(() => {
    const nav = document.getElementById("menu");
    nav.className += " isPlay"
  }, []);


  const { full } = props?.match?.params;
  const location = useLocation();

  const { gameId, sceneId } = location.state;
  const userHistory = props.history;

  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const isPause = useSelector((state) => state.gameplay.isPause);

  const ratio = 1080 / 1920;

  const [windowWidth, setwindowWidth] = useState(window.innerWidth);
  const [windowHeight, setwindowHeight] = useState(window.innerHeight);
  const [i, setI] = useState(0);
  const [Scene, setScene] = useState({});
  const [Dislike, setDislike] = useState(false);
  const [History, setHistory] = useState({});
  const [HistoryMap, setHistoryMap] = useState(false);
  const [Log, setLog] = useState(false);
  // const [TreeMap, setTreeMap] = useState(false);
  const [lastMotion, setLastMotion] = useState(false)
  const [view, setView] = useState(0);
  const [thumbsUp, setThumbsUp] = useState(0);
  const [isClicked, setIsClicked] = useState(false);

  const prevSceneId = useSelector(state => state.sync.prevSceneId);

  const maximizableElement = useRef(null);

  const handleExitFullscreen = () => document.exitFullscreen();
  const fullButton = useRef();
  let isFullscreen, setIsFullscreen;
  let errorMessage;
  try {
    [isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement);
  } catch (e) {
    errorMessage = "";
    isFullscreen = false;
    setIsFullscreen = undefined;
  }
  useEffect(() => {
    if (full === "full") {
      const rootDom = document.getElementById("root");
      const footer = rootDom.getElementsByClassName("footer-container");
      if (footer[0]) {
        footer[0].remove();
      }
    }
  }, [])


  useKey("Enter", handleEnter);
  useKey("Space", handleEnter);
  useKey("Digit1", handleChoice);
  useKey("Digit2", handleChoice);
  useKey("Digit3", handleChoice);
  useKey("Digit4", handleChoice);


  useEffect(() => {
    socket.off("accept_final_change");
    socket.on("accept_final_change", data => {
      const { sceneId, title } = data;
      let newNextList = Scene.nextList ? [...Scene.nextList] : [];
      newNextList.push({ sceneId, script: title });
      const newScene = { ...Scene, nextList: newNextList };
      setScene(newScene);
    })
  }, [Scene])

  const [volume, setVolume] = useState(0.5)
  const [muted, setMuted] = useState(false)
  const tempVolume = useRef(0.5)

  const mute = () => {
    if (muted) {
      setMuted(false)
      volumeControl(tempVolume.current)
    } else {
      tempVolume.current = volume
      setMuted(true)
      volumeControl(0)
    }
  }

  const volumeControl = (volume) => {
    setVolume(volume)
    volume === 0 ? setMuted(true) : setMuted(false)
    bgm_audio.volume = volume
    sound_audio.volume = volume
  }

  const [isFirstCut, setIsFirstCut] = useState(true);
  function playMusic(i) {
    if (isFirstCut) setIsFirstCut(false);
    if (Scene?.cutList[i]?.bgm.music) {
      //이전 곡과 같은 bgm이 아니라면
      if (
        !(i > 0 && Scene.cutList[i - 1].bgm.music == Scene.cutList[i]?.bgm.music)
      ) {
        bgm_audio.pause();
        bgm_audio.src = Scene.cutList[i]?.bgm.music;
        bgm_audio.play();
      }
    }
    if (Scene?.cutList[i]?.sound.music) {
      sound_audio.pause();

      sound_audio.src = Scene.cutList[i]?.sound.music;
      sound_audio.play();
    }
  }

  const [isTyping, setIsTyping] = useState(true);


  function handleEnter(event) {
    //! 타이핑 끝 & 미니맵 X
    if (!isTyping && !isPause) {
      if (i < Scene?.cutList?.length - 1) {
        playMusic(i + 1);
        setI(i + 1);
        setIsTyping(true);
      }
      else if (i == Scene?.cutList?.length - 1) {
        //! 엔딩자리
        setLastMotion(true)
        // setIsTyping(true)
      }
    }
  }

  function handleChoice(event) {
    if (i === Scene.cutList.length - 1 && !isPause) {
      if (Scene.nextList[parseInt(event.key) - 1]) {
        userHistory.replace({
          pathname: `/gameplay`,
          state: {
            sceneId: Scene.nextList[parseInt(event.key) - 1].sceneId,
            gameId: gameId,
          }
        })
      } else {
        if (parseInt(event.key) - 1 === Scene.nextList.length) {
          dispatch(gamePause(true));
          event.preventDefault();
          let choice = document.getElementById("choice");
          if (choice) {
            choice.click();
          }
        }
      }
    }
  }

  function onClick_thumbsUp() {
    if (user && user.userData) {
      // setUpdate((state) => state+1);
      const variable = {
        userId: user.userData._id,
        objectId: sceneId
      }
      Axios.post("/api/thumbsup/", variable).then((response) => {
        if (response.data.success) {
          setIsClicked(response.data.isClicked);
          setThumbsUp(response.data.thumbsup);
        }
      })
    }
    else {
      message.error("로그인이 필요합니다.")
    }
  }

  useEffect(() => {
    if (user && user.userData) {
      const variable_thumbsup = {
        objectId: sceneId,
        userId: user.userData._id,
      }
      Axios.post("/api/thumbsup/count", variable_thumbsup).then((response) => {
        if (response.data.success) {
          setIsClicked(response.data.isClicked);
          setThumbsUp(response.data.thumbsup);
        }
      })
      const variable_view = {
        userId: user.userData._id,
        objectId: sceneId
      }
      Axios.post("/api/view/", variable_view).then((response) => {
        if (response.data.success) {
          setView(response.data.view);
        }
      })
    }
  }, [sceneId, user])

  useEffect(() => {
    socket.emit("leave room", { room: prevSceneId });
    socket.emit("room", { room: sceneId });
    // socket.emit("exp_val", {room: sceneId});
    dispatch(savePrevScene({ prevSceneId: sceneId }));
    socket.off("empty_num_changed") //! 매번 열린다.
    socket.on("empty_num_changed", data => {
      dispatch(loadEmptyNum({
        sceneId,
        emptyNum: data.emptyNum
      }));
    })
    socket.emit("validate_empty_num", { scene_id: sceneId })

  }, [sceneId])

  //* navigation bar and footer control
  useEffect(() => {
    // dispatch(navbarControl(false));
    // dispatch(footerControl(false));
  }, []);

  //* game pause control
  useEffect(() => {
    // if (HistoryMap || Dislike || TreeMap) {
    if (HistoryMap || Dislike || Log) {
      dispatch(gamePause(true));
    } else {
      dispatch(gamePause(false));
    }
  }, [HistoryMap, Dislike, Log]);

  useEffect(() => {
    setLastMotion(false)
    Axios.get(`/api/game/getnextscene/${gameId}/${sceneId}`).then(
      (response) => {
        if (response.data.success) {
          const history = {
            gameId: gameId,
            sceneId: response.data.sceneIdList,
          };
          setIsTyping(true)
          setHistory(history);
          setI(0);
          bgm_audio.pause();
          sound_audio.pause();
          setIsFirstCut(true);
          setScene(response.data.scene);
          dispatch(gamePause(false));
          dispatch(gameLoadingPage(0));
          // dispatch(gameLoadingPage(6));
        } else {
          if (response.data.msg)
            message.error(response.data.msg);
          props.history.replace(`/game/${gameId}`);
        }
      }
    )
  }, [sceneId]);


  useEffect(() => {
    function handleResize() {
      setwindowWidth(window.innerWidth);
      setwindowHeight(window.innerHeight);
    }
    window.addEventListener("resize", handleResize);
  }, [window.innerWidth, window.inner]);

  const padding = isFullscreen ? 0.0 : 0.1;
  const minSize = 300;

  let newScreenSize;
  if (windowWidth * ratio > windowHeight) {
    newScreenSize = (full === "full") ? {
      width: `${windowHeight / ratio}px`,
      height: `${windowHeight}px`,
      minWidth: `${minSize / ratio}px`,
      minHeight: `${minSize}px`,
    }
      : {
        width: `${(windowHeight * (1 - 2 * padding)) / ratio}px`,
        height: `${windowHeight * (1 - 2 * padding)}px`,
        minWidth: `${minSize / ratio}px`,
        minHeight: `${minSize}px`,
      };
  } else {
    newScreenSize = (full === "full") ? {
      width: `${windowWidth}px`,
      height: `${windowWidth * ratio}px`,
      minWidth: `${minSize}px`,
      minHeight: `${minSize * ratio}px`,
    } : {
      width: `${windowWidth * (1 - 2 * padding)}px`,
      height: `${windowWidth * (1 - 2 * padding) * ratio}px`,
      minWidth: `${minSize}px`,
      minHeight: `${minSize * ratio}px`,
    };
  }

  useEffect(() => {
    dispatch(loadEmptyNum({
      sceneId,
    }));

    return () => {
      bgm_audio.pause();
      sound_audio.pause();
      const nav = document.getElementById("menu");
      nav.className = "menu"
    };
  }, []);

  useEffect(() => {
    if (isFullscreen && isMobile.current)
      window.screen.orientation.lock('landscape')
    return () => {
    };
  }, [isFullscreen]);

  {/* //! detail pages */ }
  // 기존에 playPage에 있던 좋아요는 Scene의 좋아요
  // DetailPage에 있는 좋아요는 게임의 좋아요 이다.
  // 사용자 반응 및 적용 후 모습을 보고 추후에 어떻게 통폐합할지 정하자!


  if (Scene?.cutList !== undefined) {
    if (i == 0 && isFirstCut) playMusic(0);
    return (
      <div
        className={`${isFullscreen
          ? "gamePlay__container gamePlay__container_fullscreen"
          : `gamePlay__container ${full}`
          }`}
        ref={maximizableElement}
      >
        <div
          className={`${isFullscreen
            ? "gamePlay__mainContainer_fullscreen"
            : `gamePlay__mainContainer ${full}`
            }`}
        >
          <div
            className={`${isFullscreen
              ? "backgroundImg_container_fullscreen"
              : `backgroundImg_container ${full}`
              }`}
            style={newScreenSize}
            onClick={(event) => handleEnter(event)}
          >
            <LoadingPage />
            {(Scene.cutList[i] && Scene.cutList[i]?.background) ?
              <img
                className="backgroundImg"
                src={Scene.cutList[i]?.background}
                alt="Network Error"
              />
              : (
                <div></div>
              )}
            <GameCharacterBlock
              characterList={Scene?.cutList[i]?.characterList}
            />


            {i === Scene.cutList.length - 1 ? (
              <TextBlockChoice
                game_id={gameId}
                cut_name={Scene.cutList[i]?.name}
                cut_script={Scene.cutList[i]?.script}
                scene_depth={Scene.depth}
                scene_id={Scene._id}
                scene_next_list={Scene.nextList}
                setIsTyping={setIsTyping}
                isTyping={isTyping}
                isEnding={Scene.isEnding}
                isLastMotion={lastMotion}
                theme={Scene.theme}
                setScene={setScene}
              />
            ) :
              <TextBlock
                cut_name={Scene.cutList[i]?.name}
                cut_script={Scene.cutList[i]?.script}
                setIsTyping={setIsTyping}
                isTyping={isTyping}
                theme={Scene.theme}
              />
            }

            <HistoryMapPopup
              userhistory={userHistory}
              history={History}
              trigger={HistoryMap}
              setTrigger={setHistoryMap}
              setScene={setScene}
              isFullscreen={isFullscreen}
            />
            <LogPopup
              trigger={Log}
              setTrigger={setLog}
              cutList={Scene.cutList}
              i={i}
            />
            <div className="gamePlay__btn_container">
              <div>
                <button
                  className={isClicked ? "gamePlay__btnClicked" : "gamePlay__btn"}
                  onClick={(e) => { onClick_thumbsUp(); e.stopPropagation() }}
                >
                  좋아요: {thumbsUp}
                </button>
                <button
                  className="gamePlay__btn gameView"
                >
                  조회수: {view}
                </button>
                <button
                  className="gamePlay__btn"
                  onClick={(e) => { setDislike((state) => !state); e.stopPropagation() }}
                >
                  신고
                </button>
              </div><div>
                <button
                  className="gamePlay__btn"
                  onClick={(e) => { setHistoryMap((state) => !state); e.stopPropagation() }}
                >
                  미니맵
                </button>
                <button
                  className="gamePlay__btn"
                  onClick={(e) => { setLog((state) => !state); e.stopPropagation() }}
                >
                  대화기록
                </button>
                <div
                  className="gamePlay__btn sound"
                  onClick={(e) => { mute(); e.stopPropagation() }}
                >
                  {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </div>
                {errorMessage ? (
                  <button
                    onClick={(e) => {
                      alert(
                        "Fullscreen is unsupported by this browser, please try another browser."
                      );
                      e.stopPropagation()
                    }
                    }
                    className="gamePlay__btn"
                  >
                    {errorMessage}
                  </button>
                ) : isFullscreen ? (
                  <button onClick={(e) => { handleExitFullscreen(); e.stopPropagation() }} className="gamePlay__btn full">
                    <FontAwesomeIcon icon={faCompress} />
                  </button>
                ) : (
                  <button ref={fullButton} onClick={(e) => { setIsFullscreen(); e.stopPropagation() }} className="gamePlay__btn full">
                    <FontAwesomeIcon icon={faExpand} />
                  </button>
                )}
              </div>
            </div>
            {/* <DislikePopup
              sceneId={sceneId}
              gameId={gameId}
              trigger={Dislike}
              setTrigger={setDislike}
            /> */}
            <Complaint
              sceneId={sceneId}
              gameId={gameId}
              isModalVisible={Dislike}
              setIsModalVisible={setDislike}
            />
          </div>
        </div>

        <div className="detail_relative_container" />
        {/* //! detail pages */}
      </div>
    );
  } else {
    // dispatch(gameLoadingPage(0));
    // dispatch(gameLoadingPage(1));

    return (
      <div className="loader_container">
        <div className="loader">Loading...</div>
      </div>
    )
  }
};

export default ProductScreen;
