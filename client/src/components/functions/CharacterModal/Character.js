import React, { useRef, memo, useState } from 'react';
import CharacterModal from './CharacterModal';
import './Character.css';
import { useDispatch, useSelector } from 'react-redux';
import { selectCharacter } from '../../../_actions/characterSelected_actions';
import CharacterSize from './CharacterSize/CharacterSize';
import CharacterMoveX from './CharacterMove/CharacterMoveX';
import CharacterMoveY from './CharacterMove/CharacterMoveY';
import { selectMovingTarget } from '../../../_actions/movingTarget_actions';
import {addEvent, removeAllEvents} from '../handleEventListener';

function Character(props) {
  const dispatch = useDispatch();
  const { charSchema, GameCharacterList, setCharacterList , index, CharacterList } = props;
  
  const element_X = useRef();
  const element_Y = useRef();

  const [clicked,setClicked] = useState(false);
  const [moving, setMoving] = useState(false);
  const [sizing, setSizing] = useState(false);

  const background_element = document.getElementById("backgroundImg_container");

  let pivot = [0,0];
  let drag = false;

  function mouseMove(e) {
    if (drag && clicked && moving) {
      if (pivot[0]-e.pageX>13 || pivot[1]-e.pageY>13 || pivot[0]-e.pageX<-13 || pivot[1]-e.pageY<-13) {
        
        const background_width = background_element.offsetWidth;
        const background_height = background_element.offsetHeight;
        const prev_posX = Number(element_X.current.style.left.replace( /%/g, '' ));
        const prev_posY = Number(element_Y.current.style.top.replace( /%/g, '' ).replace( /px/g, '' ));
        const next_posX = prev_posX + 100*(e.pageX-pivot[0])/background_width;
        const next_posY = prev_posY + 100*(e.pageY-pivot[1])/background_height;
        element_X.current.style.left = String(next_posX)+'%';
        element_Y.current.style.top = String(next_posY)+'%';

        pivot = [e.pageX,e.pageY];
      }
    } else if (drag && clicked && sizing) {
      if (pivot[0] != e.pageX) {
        const page = [e.pageX,e.pageY];
        setCharacterList((oldArray)=> {
          const img_height = element_Y.current.offsetHeight;
          const prev_size = oldArray[index].size;
          const next_size = prev_size*(img_height-(pivot[0]-page[0]))/img_height;
          return [...oldArray.slice(0,index), {...oldArray[index], size: next_size} ,...oldArray.slice(index+1,4)]
        })
        pivot = page;
      }
    }
  }

  const onMouseEnter_initMoving = () => {
    addEvent(background_element, "mousemove", mouseMove, false);
  }

  const onMouseDown_selectMovingTarget = (e) => {
    pivot = [e.pageX,e.pageY];
    drag = true;
  }

  const onMouseUp_detachMovingTarget = (e) => {
    const page = [e.pageX,e.pageY];
    setCharacterList((oldArray)=> {
      return [
        ...oldArray.slice(0,index), 
        {...oldArray[index], posX: element_X.current.style.left, posY: element_Y.current.style.top},
        ...oldArray.slice(index+1,4)
      ]
    })
    removeAllEvents(background_element, "mousemove");
    pivot = [e.pageX,e.pageY];
    drag = false;
    setClicked((state) => !state);
    setMoving(false);
    setSizing(false);
    dispatch(selectCharacter({...GameCharacterList[charSchema.index], index: charSchema.index}));


    // e.preventDefault();
    // e.stopPropagation();
  }


  return (
    <div 
      ref={element_X}
      key={index} 
      className="CharacterBlock"
      style={{ left: `${charSchema.posX}%`}}
    >
      <div 
        ref={element_Y}
        className="character__container"
        style={{height: `${charSchema.size}%`,
                top: `${charSchema.posY}%`}}
      >
          <img
            onMouseEnter={onMouseEnter_initMoving}
            onMouseDown={onMouseDown_selectMovingTarget}
            onMouseUp={onMouseUp_detachMovingTarget}
            className={`${clicked ? "characterImg_clicked" : "characterImg"}`}
            id={`${index}`}
            src={charSchema.image}
            alt="img"
          />
          {clicked &&
          <div 
            className={`${moving ? "btn_moving_clicked" : "btn_moving"}`} 
            onClick={() => {setMoving((state)=>!state);setSizing(false)}}
          >위치 조절</div>
          }
          {clicked &&
          <div 
            className={`${sizing ? "btn_sizing_clicked" : "btn_sizing"}`} 
            onClick={() => {setMoving(false);setSizing((state)=>!state)}}
          >사이즈 조절</div>
          }
      </div>
    </div>
  )
}

export default memo(Character)
