import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import moment from "moment";
import { useSelector, useDispatch } from 'react-redux';

import AddEditMeal from '../ui/AddEditMeal';
import { GetThisMonday } from '../../utils/dates';

import {
  selectedFamily,
  addBoard,
  deleteMeal
} from '../family/familySlice';

import { 
  selectDays, 
  selectMeals,
  selectSelectedWeek,
  selectWeek,
  selectBoard,
  fetchWeek,
  addMealToWeek,
  deleteMealFromWeek,
  addWeek,
  removeMealFromWeek
} from './boardSlice';

import binimg from './bin.png';

const Row = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;

  width: 100vw;
`

const Cell = styled.div`
  flex-grow: 0;
  width: calc(100% / 8);
`

const WeekHeader = styled(Cell)`
  font-weight: bold;
  text-align: center;
  border-left: solid 1px black;
`

const MealRow = styled(Row)`
  height: 200px;
  border-top: solid 1px black;
`

const MealCell = styled(Cell)`
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  align-content: flex-start;

  &[data-selectedslot="yes"] {
    background-color: #ADD8E6;
  }

  &:first-child {
    margin-left: 1px;
  }

  &:not(:first-child) {
    border-left: solid 1px black;
  }
`

const MealHeaderCell = styled(MealCell)`
  p {
    padding-left: 10px;
  }
`

const MealsTray = styled.div`
  width: 100vw;
`

const MealsTrayHeader = styled.div`
  width: calc(100% - 15px);
  background-color: #efefef;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: baseline;
  margin: 5px;
  padding-left: 5px;
  align-items: center;
`

const HeaderCellSmall = styled.div`
  flex: 0 1 auto;
  display: flex;
  align-items: center;

  p {
    margin-top: 5px;
    margin-bottom: 5px;
    margin-left: 5px;
  }
`

const HeaderCellGrow = styled.div`
  flex: 2 1 auto;
  text-align: right;

`

const SearchLabel = styled.label`
  display: inline-block;
  text-align: left;
  padding-right: 20px;
`

const MealsList = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
`

const Pill = styled.div`
  background-color: blue;
  border-radius: 5px;
  padding: 5px;
  color: white;
  height: auto;
  margin: 5px;

  &[data-selected="yes"] {
    background-color: red;
  }

  &[data-beingdragged="yes"] {
    z-index: 20;
  }
`

const Blockout = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  background: rgba(51, 51, 51, 0.7);
  z-index: 10;
`

const Wastebasket = styled.div`
  position: absolute;
  border-radius: 50%;
  background-color: white;
  width: 200px;
  height: 200px;
  bottom: 100px;
  left: calc(50vw - 100px);

  img {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 50%;
  }
`

const MealPill = ({mealName, onDS, onClick, selectedMeal}) => {
  return(
    <Pill draggable={true} onDragStart={onDS} onClick={onClick} data-selected={selectedMeal}>
      {mealName}
    </Pill>
  )
}

const MealCellPill = ({mealName, onDS, onDE, onClick, beingDragged}) => {
  return(
    <Pill draggable={true} onDragStart={onDS} onDragEnd={onDE} onClick={onClick} data-beingdragged={beingDragged}>
      {mealName}
    </Pill>
  )
}

export default function Board(props) {
  const dispatch = useDispatch();

  const days = useSelector(selectDays);
  const selectedFam = useSelector(selectedFamily);
  const mealSlots = useSelector(selectMeals);
  const selectedWeek = useSelector(selectSelectedWeek);
  const week = useSelector(selectWeek);
  const selectedBoard = useSelector(selectBoard);

  const [mealSearch, setMealSearch] = useState("");
  const [dragDay, setDragDay] = useState("");
  const [dragMealSlot, setDragMealSlot] = useState("");
  const [displayBoard, setDisplayBoard] = useState(false);
  const [showAddEditMeal, setShowAddEditMeal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(0);
  const [dragMode, setDragMode] = useState("");
  const [beingDragged, setBeingDragged] = useState(0);
  
  useEffect(() => {
    if(typeof(selectedFam.id) !== "undefined" && typeof(selectedBoard.id) !== "undefined" && typeof(selectedWeek.id) !== "undefined") {
      console.log("fetching week");
      dispatch(fetchWeek({
        family_id: selectedFam.id,
        board_id: selectedBoard.id,
        week_id: selectedWeek.id
      }));
      setDisplayBoard(true);
    } else {
      if(typeof(selectedFam.id) !== "undefined" && typeof(selectedBoard.id) !== "undefined") {
        // I think this is a new board without any weeks
        // so lets add a Week
        console.log("board without weeks, so creating one for this week");
        var mondayDate = GetThisMonday();
        dispatch(addWeek({
          family_id: selectedFam.id,
          board_id: selectedBoard.id,
          week_start_date: mondayDate + "T00:00:00"
        }));
      } else {
        if(typeof(selectedFam.id) !== "undefined") {
          if(selectedFam.boards.length === 0) {
            // this is a family group without any boards
            // so let's add one
            console.log("family has no boards");
            // let's create a board
            dispatch(addBoard({
              family_id: selectedFam.id,
              board_name: selectedFam.family_name + " Board",
              private: false,
            }));
            setDisplayBoard(true);
          }
        } else {
          setDisplayBoard(false);
        }
      }
    }
  }, [selectedBoard.id, selectedFam.id, selectedWeek.id, selectedFam.family_name, selectedFam.boards, dispatch]);

  const startAddMeal = () => {
    setShowAddEditMeal(true);
  }

  const delMeal = () => {
    console.log("delete meal", selectedMeal);
    dispatch(deleteMeal({
      family_id: selectedFam.id,
      meal_id: selectedMeal
    }));
    // need to remove the meals from the board on the screen
    dispatch(deleteMealFromWeek(selectedMeal));
    setSelectedMeal(0);
  }

  const closeAddMeal = () => {
    setShowAddEditMeal(false);
  }

  const onDragEnterMealSlot = (meal, day, e) => {
    console.log("drag entered meal-slot", meal, day);
    if(dragMode === "addtoslot") {
      setDragDay(day);
      setDragMealSlot(meal);
    }
  }

  const onDragLeaveMealSlot = (meal, day, e) => {
    if(dragDay === day && dragMealSlot === meal) {
      setDragDay("");
      setDragMealSlot("");
    }
  }
  const onDragMealStart = (meal, e) => {
    setDragMode("addtoslot");
    e.dataTransfer.setData("meal_id", meal);
    console.log("set meal_id to", meal);
  }

  const onDragExistingMealStart = (meal, e) => {
    console.log("starting drag", meal);
    setBeingDragged(meal);
    setDragMode("delete");
    e.dataTransfer.setData("week_to_meal", meal);
  }

  const onDragExistingMealEnd = (e) => {
    if(dragMode === "delete" && (e?.dataTransfer?.dropEffect === "none" || e?.dataTransfer?.dropEffect === "copy")) {
      console.log("no drag action");
      setBeingDragged(0);
      setDragMode("");
    }
    //console.log("drag meal end", e?.dataTransfer);
  }

  const onDragMealDrop = (meal, day, e) => {
    e.preventDefault();
    if(dragMode === "addtoslot") {
      var meal_id = e.dataTransfer.getData("meal_id");
      console.log("dropped meal", meal_id, "on", day, meal);
      var dayCount = days.findIndex(dayName => dayName === day) + 1;
      console.log("day count", dayCount, "start date", selectedWeek.week_start_date);
      var date = moment(selectedWeek.week_start_date).add(dayCount, 'days');
      console.log("date for day", date.toISOString().substring(0,"YYYY-MM-DD".length));

      dispatch(addMealToWeek({
        family_id: selectedFam.id,
        board_id: selectedBoard.id,
        week_id: selectedWeek.id,
        meal_slot: meal,
        meal_id: meal_id,
        day: date.toISOString().substring(0, "YYYY-MM-DD".length)
      }));
      
      setDragDay("");
      setDragMealSlot("");
      setDragMode("");
    }
  }

  const onDragMealToDelete = (e) => {
    e.preventDefault();
    var week_to_meal_id = e.dataTransfer.getData("week_to_meal");
    console.log("delete, meal id", week_to_meal_id);

    dispatch(removeMealFromWeek({
      family_id: selectedFam.id,
      board_id: selectedBoard.id,
      week_id: selectedWeek.id,
      week_to_meal_id: week_to_meal_id
    }));

    setBeingDragged(0);
    setDragMode("");
  }

  const selectMealPill = (meal) => {
    console.log("selecting meal id", meal);
    if(selectedMeal === meal) {
      setSelectedMeal(0);
    } else {
      setSelectedMeal(meal);
    }
  }

  const DayHeaders = days.map(day => <WeekHeader key={"week_" + day}><p>{day}</p></WeekHeader>);
  const MealRows = mealSlots.map(meal => {
    const mealDays = days.map(day => {
      var dayCount = days.findIndex(dayName => dayName === day) + 1;
      var date = moment(selectedWeek.week_start_date).add(dayCount, 'days');
      date = date.toISOString().substring(0, "YYYY-MM-DD".length);
      const mealPills = Object.keys(week).length !== 0 && week.meals.filter(m => m.meal_slot === meal && m.day.substring(0, 10) === date).map(m => 
        <MealCellPill 
          key={"week_to_meal_" + m.id}
          mealName={m.meal.meal_name}
          onDS={onDragExistingMealStart.bind(null, m.id)}
          onDE={onDragExistingMealEnd}
          beingDragged={beingDragged === m.id ? "yes" : "no"}
        />
      );

      return (
        <MealCell 
          onDragEnter={onDragEnterMealSlot.bind(null, meal, day)} 
          onDragLeave={onDragLeaveMealSlot.bind(null, meal, day)}
          onDrop={onDragMealDrop.bind(null, meal, day)}
          onDragOver={(e) => {e.preventDefault()}}
          data-selectedslot={dragDay === day && dragMealSlot === meal ? "yes" : "no"}
          key={"mealday_" + meal + "_" + day}
        >
          {mealPills}
        </MealCell>
      )
    });

    return (
      <MealRow key={"mealslot_" + meal}>
        <MealHeaderCell><p>{meal}</p></MealHeaderCell>
        {mealDays}
      </MealRow>
    )

  });
  const Meals = Object.keys(selectedFam).length !== 0 && selectedFam.meals.filter(meal => meal.meal_name.toLowerCase().includes(mealSearch.toLowerCase())).map(meal => <MealPill 
    key={"meal_" + meal.id}
    mealName={meal.meal_name}
    onClick={selectMealPill.bind(null, meal.id)} 
    selectedMeal={meal.id === selectedMeal ? "yes" : "no"}
    onDS={onDragMealStart.bind(null, meal.id)}
  />)

  return (
    displayBoard && <div>
      {dragMode === "delete" && <Blockout>
        <Wastebasket>
          <img alt="bin" src={binimg} onDrop={onDragMealToDelete} onDragOver={(e) => {e.preventDefault()}} />
        </Wastebasket>
      </Blockout>}
      <AddEditMeal show={showAddEditMeal} close={closeAddMeal} />
      <Row>
        <WeekHeader></WeekHeader>
        {DayHeaders}
      </Row>
      {MealRows}
      <MealsTray>
        <MealsTrayHeader>
          <HeaderCellSmall>
            <p>Meals</p>
            <button onClick={startAddMeal}>Add Meal</button>
            {selectedMeal !== 0 && <button onClick={delMeal}>Remove Meal</button>}
          </HeaderCellSmall>
          <HeaderCellGrow>
            <SearchLabel>Search:</SearchLabel>
            <input 
              style={{marginRight: "10px"}}
              type="text" 
              value={mealSearch}
              onChange={(e) => {
                setMealSearch(e.target.value);
              }}
            />
          </HeaderCellGrow>
        </MealsTrayHeader>
        <MealsList>
          {Meals}
        </MealsList>
      </MealsTray>
    </div>
  )
}

