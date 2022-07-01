import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import moment from "moment";
import { useSelector, useDispatch } from 'react-redux';

import AddBoard from '../ui/AddBoard';
import AddFamily from '../ui/AddFamily';
import AddUser from '../ui/AddUser';
import { GetRelativeWeek, GetThisMonday } from '../../utils/dates';

import cog from './cog.png';
import hamburger from './more.png';

import { 
  fetchUser,
  setDefaultBoard,
  selectNewUser,
  selectGotUser,
  selectUser
} from '../user/userSlice';

import { 
  fetchAll,
  selectFamilies,
  selectedFamily,
  selectedBoard,
  setFamily,
  setBoard,
  setBothFamilyAndBoard,
  selectGotFamilies,
  addFamily
} from './familySlice';

import {
  fetchBoard,
  clearBoard,
  selectSelectedWeek,
  selectBoard,
  addWeek,
  switchWeek,
  copyFromWeek,
  addWeekAndCopy
} from '../board/boardSlice';

import { addError } from '../ui/errorSlice';

const NavContainer = styled.div`
  background-color: #f1f1f1;
  margin-bottom: 5px;
  padding-left: 5px;
  width: calc(100vw - 5px);
  height: 50px;
  display: flex;
  align-items: center;

  button {
    height: 50px;
    border: none;
    cursor: pointer;
    font-size: 12pt;
  }

  button:hover {
    background-color: #ccc;
  }

  button:active {
    padding-left: 7px;
    padding-top: 2px;
    padding-bottom: 0px;
    padding-right: 5px;
    background-color: #4CAF50;
    color: #ffffff;
  }

  font-size: 12pt;
`

const NavDivider = styled.div`
  margin-left: 5px;
  margin-right: 5px;
  height: 50px;
`

const NavSelect = styled.select`
  margin-left: 5px;
  margin-right: 5px;
  max-width: 190px;
  width: 190px;
`

const WeekSelector = styled.div`
  display: flex;
  align-items: center;

  button {
    margin-left: 5px;
    margin-right: 5px;
  }
`

const NavRightAlign = styled.div`
  flex: 2 1 auto;
  text-align: right;
`

const CogImg = styled.img`
  width: 30px;
  height: 30px;
  margin: 10px;
  cursor: pointer;
`

const HamburgerImg = styled.img`
  width: 30px;
  height: 30px;
  margin: 10px;
  cursor: pointer;
  z-index: 6;
`

const DropDownMenu = styled.div`
  border-top: solid 5px grey;
  position: absolute;
  top: 50px;
  right: 0px;
  width: 200px;
  display: ${props => props.show ? "block" : "none"};
  background-color: #efefef;

  ul {
    list-style-type: none;
    margin: 10px;
    padding: 0px;
  }

  li {
    padding: 5px;
    cursor: pointer;
  }

  li:hover {
    background-color: white;
    border-left: solid 1px black;
  }
`

const SideTray = styled.div`
  position: absolute;
  z-index: 5;
  width: 300px;
  height: calc(100vh - 55px);
  top: 0;
  left: 0;
  background-color: #f1f1f1;
  padding-top: 55px;
  padding-left: 10px;
  transform: translateX(-310px);
  transition: transform 0.5s ease;

  &[data-visible="yes"] {
    transform: translateX(0);
    display: block;
  }

  button {
    margin-left: 5px;
    margin-right: 5px;
  }

`

export default function NavBar(props) {
  const dispatch = useDispatch();
  const families = useSelector(selectFamilies);
  const selectedFam = useSelector(selectedFamily);
  const selected_Board = useSelector(selectedBoard);
  const board = useSelector(selectBoard);
  const selectedWeek = useSelector(selectSelectedWeek);
  const newUser = useSelector(selectNewUser);
  const gotUser = useSelector(selectGotUser);
  const gotFamilies = useSelector(selectGotFamilies);
  const user = useSelector(selectUser);

  const [showAddBoard, setShowAddBoard] = useState(false);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [boardAddEditMode, setBoardAddEditMode] = useState("add");
  const [familyAddEditMode, setFamilyAddEditMode] = useState("add");
  const [userAddEditMode, setUserAddEditMode] = useState("add");
  const [firstLoadFlag, setFirstLoadFlag] = useState(true);
  const [loadPage] = useState(0);

  const [showSideTray, _setShowSideTray] = useState(false);
  const showSideTrayRef = useRef(showSideTray);
  const setShowSideTray = data => {
    showSideTrayRef.current = data;
    _setShowSideTray(data);
  }

  const sideBarRef = useRef();

  useEffect(() => {
    dispatch(fetchUser());
  }, [loadPage, dispatch]);

  useEffect(() => {
    if(gotUser === true) {
      dispatch(fetchAll());
    }
  }, [gotUser, dispatch]);

  useEffect(() => {
    if(gotFamilies === true) {
      if(families.length === 0) {
        console.log("we need to create a family");
        dispatch(addFamily({
          family_name: `${user.first_name}'s Family`
        }));
      } else {
        // need to check if default family and board exists, if so select it
        if(user.default_board !== null) {
          console.log("got families and default board is set");
          const family = families.filter(f => f.id === user.default_board.family_id);
          if(family.length > 0 && firstLoadFlag) {
            console.log("default board family", family[0]);
            const b = family[0].boards.filter(b => b.id === user.default_board.id);
            if(b.length > 0) {
              console.log("default board", b[0]);
              if(b[0].id !== selected_Board.id) {
                if(family[0].id !== selectedFam.id) {
                  console.log("need to change family & board");
                  dispatch(clearBoard());
                  dispatch(setBothFamilyAndBoard({
                    family: family[0],
                    board: b[0]
                  }));
                } else {
                  console.log("need to change board only");
                  dispatch(setBoard(b[0]))
                }
              }
            }
          }
        }
        setFirstLoadFlag(false);
      }
    }
  }, [gotFamilies, families, user, dispatch])

  useEffect(() => {
    console.log("dispatching fetchboard, family", selectedFam.id, "board", selected_Board.id);

    if(typeof(selectedFam.id) !== "undefined" && typeof(selected_Board.id) !== "undefined") {
      dispatch(fetchBoard({
        family_id: selectedFam.id,
        board_id: selected_Board.id
      }));
    } else {
      dispatch(clearBoard());
    }
  }, [selected_Board.id, selectedFam.id, dispatch]);

  useEffect(() => {
    if(newUser === true) {
      setUserAddEditMode("add");
      setShowAddUser(true);
    }
  }, [newUser]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      console.log("outside click", showSideTrayRef.current);
      if(sideBarRef.current && !sideBarRef.current.contains(e.target)) {
        if(showSideTrayRef.current) {
          setShowSideTray(false);
        }
      }
    }

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    }
  }, [sideBarRef]);

  const editBoard = () => {
    setShowMenu(false);
    setBoardAddEditMode("edit");
    setShowAddBoard(true);
  }

  const startAddBoard = () => {
    setBoardAddEditMode("add");
    setShowAddBoard(true);
  }

  const closeAddBoard = () => {
    setShowAddBoard(false);
  }

  const editFamily = () => {
    setShowMenu(false);
    setFamilyAddEditMode("edit");
    setShowAddFamily(true);
  }

  const startAddFamily = () => {
    setFamilyAddEditMode("add");
    setShowAddFamily(true);
  }

  const closeAddFamily = () => {
    setShowAddFamily(false);
  }

  const editUser = () => {
    setShowMenu(false);
    setUserAddEditMode("edit");
    setShowAddUser(true);
  }

  const closeAddUser = () => {
    setShowAddUser(false);
  }

  const copyFromPrevWeek = () => {
    // find out if the prev week exists
    var startOfNextWeek = moment(selectedWeek.week_start_date).subtract(7, 'days').format("YYYY-MM-DD");
    console.log("copyFromPrevWeek: start of prev week is", startOfNextWeek);
    var prevWeek = board.weeks.filter(week => week.week_start_date.startsWith(startOfNextWeek));
    if(prevWeek.length === 0) {
      console.log("no prev week found, nothing to copy");
      dispatch(addError("There is no previous week to copy from."));
    } else {
      console.log("prev week exists, copying");
      dispatch(copyFromWeek({
        family_id: selectedFam.id,
        board_id: board.id,
        week_id: selectedWeek.id,
        from_week_id: prevWeek[0].id
      }))
    }
  }

  const gotoPrevWeek = () => {
    // find out if the prev week exists
    var startOfNextWeek = moment(selectedWeek.week_start_date).subtract(7, 'days').format("YYYY-MM-DD");
    console.log("start of prev week is", startOfNextWeek);
    var prevWeek = board.weeks.filter(week => week.week_start_date.startsWith(startOfNextWeek));
    if(prevWeek.length === 0) {
      console.log("no prev week found");
      dispatch(addError("There is no previous week."));
    } else {
      console.log("prev week exists");
      dispatch(switchWeek(prevWeek[0]));
    }
  }

  const copyToNextWeek = () => {
    // find if next week exists already
    var startOfNextWeek = moment(selectedWeek.week_start_date).add(7, 'days').format("YYYY-MM-DD");
    console.log("start of next week is", startOfNextWeek);
    var nextWeek = board.weeks.filter(week => week.week_start_date.startsWith(startOfNextWeek));
    if(nextWeek.length === 0) {
      console.log("no next week found, need to create one and then copy");
      dispatch(addWeekAndCopy({
        family_id: selectedFam.id,
        board_id: board.id,
        week_start_date: startOfNextWeek + "T00:00:00",
        from_week_id: selectedWeek.id
      }));
    } else {
      console.log("next week already exists, copying");
      dispatch(switchWeek(nextWeek[0]));
      dispatch(copyFromWeek({
        family_id: selectedFam.id,
        board_id: board.id,
        week_id: nextWeek[0].id,
        from_week_id: selectedWeek.id
      }))
    }
  }

  const gotoNextWeek = () => {
    // find if next week exists already
    var startOfNextWeek = moment(selectedWeek.week_start_date).add(7, 'days').format("YYYY-MM-DD");
    console.log("start of next week is", startOfNextWeek);
    var nextWeek = board.weeks.filter(week => week.week_start_date.startsWith(startOfNextWeek));
    if(nextWeek.length === 0) {
      console.log("no next week found, need to create one");
      dispatch(addWeek({
        family_id: selectedFam.id,
        board_id: board.id,
        week_start_date: startOfNextWeek + "T00:00:00"
      }));
    } else {
      console.log("next week already exists");
      dispatch(switchWeek(nextWeek[0]));
    }
  }

  const gotoThisWeek = () => {
    // determine the date of the Monday of the current week
    var mondayDate = GetThisMonday()
    console.log("date on Monday this week", mondayDate);
    // need to check if this week exists
    var week = board.weeks.filter(week => week.week_start_date.startsWith(mondayDate));
    if(week.length === 0) {
      console.log("no current week found");
      dispatch(addWeek({
        family_id: selectedFam.id,
        board_id: board.id,
        week_start_date: mondayDate + "T00:00:00"
      }));
    } else {
      console.log("found the current week");
      dispatch(switchWeek(week[0]));
    }
  }

  const familyOptions = families.map(family => <option key={"family_" + family.id} value={family.id}>{family.family_name}</option>);
  const boardOptions = families.length > 0 
    && selectedFam.boards
    .filter(board => board.scope === "family" || (board.scope === "private" && board.owning_user_id === user.id))  
    .map(board => <option key={"board_" + board.id} value={board.id}>{board.board_name}</option>);
  const currentWeek = Object.keys(selectedWeek).length !== 0 
  && <WeekSelector>
    <button onClick={gotoPrevWeek}>&lt;</button>
    <p>{GetRelativeWeek(selectedWeek.week_start_date)}</p>
    <button onClick={gotoNextWeek}>&gt;</button>
  </WeekSelector>

  const switchFamily = (id) => {
    var family = families.filter(family => family.id === parseInt(id))[0];
    dispatch(clearBoard());
    dispatch(setFamily(family));
  }

  const switchBoard = (id) => {
    var board = selectedFam.boards.filter(board => board.id === parseInt(id))[0];
    dispatch(setBoard(board));
  }

  const setUserDefaultBoard = () => {
    dispatch(setDefaultBoard({
      default_board_id: selected_Board.id
    }));
  }

  return (
    <div>
      <AddFamily
        show={showAddFamily}
        close={closeAddFamily}
        mode={familyAddEditMode}
      />
      <AddBoard
        show={showAddBoard} 
        close={closeAddBoard} 
        mode={boardAddEditMode}
      />
      <AddUser
        show={showAddUser} 
        close={closeAddUser} 
        mode={userAddEditMode}
      />
      <SideTray
        data-visible={showSideTray ? "yes" : "no"}
        ref={sideBarRef}
      >
        <p>Family:</p>
        <NavSelect value={selectedFam.id} onChange={event => switchFamily(event.target.value)}>
          {familyOptions}
        </NavSelect>
        <button onClick={startAddFamily}>Add Family</button>
        <p>Board:</p>
        {selectedFam !== -1 &&
        <NavSelect value={selected_Board.id} onChange={event => switchBoard(event.target.value)}>
          {boardOptions}
        </NavSelect>}
        <button onClick={startAddBoard}>Add Board</button>
        <button style={{marginTop: "10px"}} onClick={setUserDefaultBoard}>Make this my default board</button> 
      </SideTray>
      <NavContainer>
        <HamburgerImg src={hamburger} onClick={(e) => {
          setShowSideTray(!showSideTray);
          e.stopPropagation();
        }} />
        <p style={{zIndex: "6"}}><b>Meal</b>Board</p>
        <NavDivider/>
        {currentWeek}
        <NavDivider/>
        <button onClick={gotoThisWeek}>Go to today</button>
        <NavDivider/>
        <button onClick={copyToNextWeek}>Copy to next week</button>
        <NavDivider/>
        <button onClick={copyFromPrevWeek}>Copy from previous week</button>
        <NavRightAlign>
          <CogImg src={cog} onClick={() => {setShowMenu(!showMenu)}}/>
        </NavRightAlign>
        <DropDownMenu show={showMenu}>
          <ul>
            <li onClick={editBoard}>Board Settings</li>
            <li onClick={editFamily}>Family Settings</li>
            <li onClick={editUser}>User Settings</li>
          </ul>
        </DropDownMenu>
      </NavContainer>
    </div>
  )
}