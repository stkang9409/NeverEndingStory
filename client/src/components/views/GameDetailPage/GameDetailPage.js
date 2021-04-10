import { message } from "antd";
import Axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Comment from '../Comment/Comment.js';
import { socket } from "../../App";
import { SVG } from "../../svg/icon";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faHeart, faLink } from "@fortawesome/free-solid-svg-icons";
import { of, forkJoin, Observable } from "rxjs";
import { map, tap, flatMap } from "rxjs/operators";
import TopRatingContributer from "./TopRatingContributer";

import "./GameDetailPage.css";
import AdminPage from "./AdminPage";
import { Link } from "react-router-dom";
import RadialTree from "../TreeVisualization/RadialTree.js";
import qs from "qs";
import { Invitaion } from "./Invitation";
import GameForkButton from "./GameForkButton.js";

const config = require('../../../config/key')

export default function GameDetailPage(props) {
    const query = qs.parse(props.location?.search, { ignoreQueryPrefix: true });
    const gameId = props.match.params.gameId;

    const [gameDetail, setGameDetail] = useState({});
    const [sceneId, setSceneId] = useState([]);
    const [isMaking, setIsMaking] = useState(false);
    const [view, setView] = useState(0);
    const [thumbsUp, setThumbsUp] = useState(0);
    const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
    const [totalSceneCnt, setTotalSceneCnt] = useState(0);
    const [ContributerCnt, setContributerCnt] = useState(0);
    const [contributerList, setContributerList] = useState([]);
    const [isPlayed, setIsPlayed] = useState(false);

    const user = useSelector((state) => state.user);

    const playFirstScene = async (isFirst, isInvitation) => {
        try {
            let response;
            if (isFirst) {
                response = await Axios.get("/api/users/playing-list/clear");
                // Not Yet Tested
                if (user.userData.isAuth && isMaking) {
                    socket.emit("empty_num_increase", { user_id: user.userData._id.toString(), scene_id: response.data.prevOfLastScene.toString() });
                }
            }
            props.history.replace({
                pathname: (!isFirst && isMaking) ? `/scene/make` : `/gameplay${isInvitation ? "/full" : ""}`,
                state: {
                    sceneId: isFirst ? response.data.teleportSceneId : sceneId,
                    gameId: gameId,
                }
            })
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
    }, []);
    
    const updateFlag = useRef(true);

    useEffect(() => {
        if (user && user.userData && updateFlag.current) {
            updateFlag.current = false;
            Axios.get(`/api/game/start/${gameId}`).then((response) => {
                if (response.data.success) {
                    setSceneId(response.data.sceneId);
                    setIsMaking(response.data.isMaking);
                } else {
                    message.error("로그인 해주세요.");
                }
            });
            
            Axios.get("/api/users/visit").then((response) => {
                if (response.data.success) {
                    const sceneIdLength = response.data?.gamePlaying?.sceneIdList?.length;
                    if (sceneIdLength > 1)
                        setIsPlayed(true);
                }
            })
            
            const userId = user.userData._id;
            Axios.get(`/api/detailpage/${gameId}/${userId}`).then((response) => {
                if (response.data.success) {
                    const {
                        topRank, 
                        contributerCnt, 
                        totalSceneCnt, 
                        gameDetail, 
                        isClicked, 
                        thumbsup
                    } = response.data;
                    setThumbsUp(thumbsup);
                    setThumbsUpClicked(isClicked);
                    setGameDetail(gameDetail);
                    setView(gameDetail.view);
                    setContributerList(topRank);
                    setContributerCnt(contributerCnt);
                    setTotalSceneCnt(totalSceneCnt);
                }
            })
        }
    }, [user])

    function onClick_thumbsUp() {
        if (user?.userData?.isAuth) {
            const variable = {
                userId: user.userData._id,
                objectId: gameId,
                flag: "1"
            }
            setThumbsUp((state) => {
                if(thumbsUpClicked){
                    return state-1;
                }
                return state+1;
            });
            setThumbsUpClicked((state) => !state);
            Axios.post("/api/thumbsup/", variable);
        }
        else {
            message.error("로그인이 필요합니다.")
        }
    }
    const pasteLink = () => {
        const url = window.location.href + "?invitation=true"
        let urlInput = document.createElement("input");
        document.body.appendChild(urlInput);
        urlInput['value'] = url;
        urlInput.select();
        document.execCommand("copy");
        document.body.removeChild(urlInput);
        message.info("링크가 복사되었습니다.")
    }
    if (query.invitation === "true") {
        return (
            <Invitaion
                gameDetail={gameDetail}
                playFirstScene={playFirstScene}
            />
        )
    }
    else if (totalSceneCnt) {
        return (
            <div className="detailPage__container">

                {/* 이미지 불러오는게 늦음 디버깅 필요 */}
                <div className="detailPage__thumbnail_container">
                    <img
                        className="detailPage__thumbnail"
                        src={
                            process.env.NODE_ENV === 'production' ?
                                gameDetail?.thumbnail
                                :
                                `${config.SERVER}/${gameDetail?.thumbnail}`}
                        alt="thumbnail"
                    />
                    <div className="detailPage__gradation"></div>
                    <div className="detailPage__contributer_container">
                        <div className="detailPage__contributer_title"> {ContributerCnt}명이 함께하는 이야기</div>
                        <TopRatingContributer
                            contributerList={contributerList}
                            creatorNickname={gameDetail?.creator?.nickname}
                            totalSceneCnt={totalSceneCnt}
                        />
                    </div>
                    <div className="detailPage__gamePlay">
                        <div className="detailPage__gamePlay_container">
                            <div className="detailPage__gamePlay_text">
                                현재 스토리
                            </div>
                            <div className="detailPage__gamePlay_sceneCntContainer">
                                <div className="detailPage__gamePlay_sceneCnt">
                                    {totalSceneCnt}
                                </div>
                                <div className="detailPage__gamePlay_cntText">
                                    개
                                </div>
                            </div>
                        </div>
                        <div
                            className="detailPage__gamePlay_link"
                            onClick={() => playFirstScene(false)}
                        >
                            <div className="icon">
                                <SVG
                                    src="playIcon_1"
                                    width="30"
                                    height="30"
                                    color="#FFF"
                                />
                            </div>
                            {isPlayed ? "이어하기" : "시작하기"}
                        </div>
                    </div>
                    <div className="detailPage__UPTitle">
                        {gameDetail?.title}
                    </div>
                    <div className="detailPage__interaction">

                        <div
                            onClick={onClick_thumbsUp}
                            className="detailPage__like"
                        >
                            {thumbsUp}
                            {thumbsUpClicked ?
                                <FontAwesomeIcon style={{ color: "red", marginLeft: "10px" }} icon={faHeart} />
                                :
                                <FontAwesomeIcon icon={faHeart} style={{ marginLeft: "10px" }} />
                            }
                        </div>
                        <div className="detailPage__view">
                            {view}
                            <FontAwesomeIcon icon={faEye} style={{ marginLeft: "10px" }} />
                        </div>
                    </div>
                    {isPlayed &&
                        <div
                            className="detailPage__gamePlayFromStart_link"
                            onClick={() => playFirstScene(true)}
                        >
                            처음부터 하기
                        </div>
                    }
                </div>
                <div className="detailPage__info_container">
                    <div className="detailPage__genre">
                        장르:
                        <div className="bold_text">
                            {gameDetail?.category}
                        </div>
                        작가:
                        <Link
                            to={`/profile/${gameDetail?.creator?._id}`}
                            className="bold_text"
                        >
                            {gameDetail?.creator?.nickname?.substr(0, 20)}
                        </Link>
                        <span
                            className="link_bttn"
                            onClick={(e) => {
                                pasteLink();
                            }}>
                            <FontAwesomeIcon
                                icon={faLink}
                            />
                            초대링크복사
                        </span>
                    </div>
                    <div className="detailPage__option">
                        {gameDetail?.creator?._id?.toString() === user?.userData?._id &&
                            <Link
                                to={`/admin/${gameId}`}
                                className="admin_btn"
                            >
                                스토리 미니맵
                        </Link>
                        }
                        <GameForkButton
                            history={props.history}
                            user={user}
                            gameId={gameId}
                        />

                    </div>
                    <div className="detailPage__description">
                        {gameDetail?.description}
                    </div>

                    <Comment gameId={gameId} />
                </div>
            </div>
        );
    }
    else {
        return (
            <div className="loader_container">
                <div className="loader">Loading...</div>
            </div>
        )
    }
}
