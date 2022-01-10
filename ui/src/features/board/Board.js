import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import moment from "moment";
import { useSelector, useDispatch } from 'react-redux';

import {
  selectedFamily
} from '../family/familySlice';

import { 
  selectDays, 
  selectMeals,
  selectSelectedWeek,
  selectWeek,
  selectBoard,
  fetchWeek,
  addMealToWeek
} from './boardSlice';

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
`

const HeaderCellSmall = styled.div`
  flex: 0 1 auto;

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
  height: 20px;
  margin: 5px;
`

const MealPill = ({mealName, onDS}) => {
  
  return(
    <Pill draggable={true} onDragStart={onDS}>
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
  
  useEffect(() => {
    if(typeof(selectedFam.id) !== "undefined" && typeof(selectedBoard.id) !== "undefined" && typeof(selectedWeek.id) !== "undefined") {
      console.log("fetching week");
      console.log(selectedFam, selectedBoard, selectedWeek);
      dispatch(fetchWeek({
        family_id: selectedFam.id,
        board_id: selectedBoard.id,
        week_id: selectedWeek.id
      }));
      setDisplayBoard(true);
    } else {
      setDisplayBoard(false);
    }
  }, [selectedBoard.id, selectedFam.id, selectedWeek.id, dispatch]);

  const onDragEnterMealSlot = (meal, day, e) => {
    console.log("drag entered meal-slot", meal, day);
    setDragDay(day);
    setDragMealSlot(meal);
  }

  const onDragLeaveMealSlot = (meal, day, e) => {
    if(dragDay === day && dragMealSlot === meal) {
      setDragDay("");
      setDragMealSlot("");
    }
  }
  const onDragMealStart = (meal, e) => {
    e.dataTransfer.setData("meal_id", meal);
    console.log("set meal_id to", meal);
  }

  const onDragMealDrop = (meal, day, e) => {
    e.preventDefault();
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
  }

  const DayHeaders = days.map(day => <WeekHeader key={"week_" + day}><p>{day}</p></WeekHeader>);
  const MealRows = mealSlots.map(meal => {
    const mealDays = days.map(day => {
      var dayCount = days.findIndex(dayName => dayName === day) + 1;
      var date = moment(selectedWeek.week_start_date).add(dayCount, 'days');
      date = date.toISOString().substring(0, "YYYY-MM-DD".length);
      const mealPills = Object.keys(week).length !== 0 && week.meals.filter(m => m.meal_slot === meal && m.day.substring(0, 10) === date).map(m => <Pill key={"week_to_meal_" + m.id}>{m.meal.meal_name}</Pill>);

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
  const Meals = Object.keys(selectedFam).length !== 0 && selectedFam.meals.map(meal => <MealPill 
    key={"meal_" + meal.id}
    mealName={meal.meal_name}
    onDS={onDragMealStart.bind(null, meal.id)}
  />)

  return (
    displayBoard && <div>
      <Row>
        <WeekHeader></WeekHeader>
        {DayHeaders}
      </Row>
      {MealRows}
      <MealsTray>
        <MealsTrayHeader>
          <HeaderCellSmall><p>Meals</p></HeaderCellSmall>
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

