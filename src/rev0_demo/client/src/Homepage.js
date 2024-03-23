import React, { useRef, useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import RightArrowSvg from "./images/right_arrow.png";
import CirclePng from "./images/circle.png";
import CheckPng from "./images/circle_check.png";
import StreakPng from "./images/streak.png";
import NoStreakPng from "./images/no_streak.png";
import axios from "axios";
import Avatar, { genConfig } from "react-nice-avatar";
import "./style.css";

const auth = getAuth();

function HomePageSlider() {
  const innerBoxRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [debtRelations, setDebtRelations] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [streakInfo, setStreakInfo] = useState({
    currentStreak: 0,
    maxStreak: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser) return;

        // Fetch debt relations from the backend API
        const response = await axios.get(
          `http://localhost:5000/api/database/userDebts/${currentUser.uid}`
        );

        // Convert netDebts object to an array of objects
        const debtArray = Object.entries(response.data.netDebts).map(
          ([email, amount]) => ({
            email,
            amount,
          })
        );

        // Fetch username for each email
        const promises = debtArray.map(async (debt) => {
          const userResponse = await axios.get(
            `http://localhost:5000/api/database/userEmail/${debt.email}`
          );
          return { ...debt, username: userResponse.data.username };
        });

        const resolvedDebts = await Promise.all(promises);

        setDebtRelations(resolvedDebts);
      } catch (error) {
        console.error("Error fetching debt relations:", error);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      try {
        // Fetch upcoming tasks from the backend API
        const response = await axios.get(
          `http://localhost:5000/api/taskManagement/tasks/user/${currentUser.uid}`
        );

        // Filter tasks that have a deadline within the next 7 days
        const currentDate = new Date();
        const todayDate = new Date(currentDate);
        todayDate.setDate(currentDate.getDate() - 1);
        const nextWeek = new Date(
          currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
        );
        const filteredTasks = response.data.filter(
          (task) =>
            new Date(task.deadlineDate) >= todayDate &&
            new Date(task.deadlineDate) <= nextWeek &&
            !task.completed
        );

        // Sort tasks by deadline date
        filteredTasks.sort(
          (a, b) => new Date(a.deadlineDate) - new Date(b.deadlineDate)
        );

        // Format the deadline date
        const formattedTasks = filteredTasks.map((task) => {
          const deadlineDate = new Date(task.deadlineDate);
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);

          let formattedDeadline;
          if (deadlineDate.toDateString() === today.toDateString()) {
            formattedDeadline = "Complete chore by Today";
          } else if (deadlineDate.toDateString() === tomorrow.toDateString()) {
            formattedDeadline = "Complete chore by Tomorrow";
          } else {
            const deadlineDay = deadlineDate.toLocaleDateString("en-US", {
              weekday: "long",
            });
            formattedDeadline = `Complete chore by ${deadlineDay}`;
          }

          return {
            ...task,
            formattedDeadline,
          };
        });

        setUpcomingTasks(formattedTasks);
      } catch (error) {
        console.error("Error fetching upcoming tasks:", error);
      }
    };

    if (currentUser) {
      fetchUpcomingTasks();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchStreakInfo = async () => {
      try {
        // Fetch user's streak information from the backend
        const response = await axios.get(
          `http://localhost:5000/api/database/userStreak/${currentUser.uid}`
        );

        // Update streakInfo state with the fetched data
        setStreakInfo({
          currentStreak: response.data.currentStreak,
          maxStreak: response.data.maxStreak,
        });
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching streak information:", error);
      }
    };

    if (currentUser) {
      fetchStreakInfo();
    }
  }, [currentUser, upcomingTasks]);

  useEffect(() => {
    const handleScroll = () => {
      if (innerBoxRef.current) {
        const scrollLeft = innerBoxRef.current.scrollLeft;
        const maxScrollLeft =
          innerBoxRef.current.scrollWidth - innerBoxRef.current.clientWidth;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < maxScrollLeft);
      }
    };

    innerBoxRef.current.addEventListener("scroll", handleScroll);
    return () =>
      innerBoxRef.current.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLeftArrowClick = () => {
    if (innerBoxRef.current) {
      innerBoxRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const handleRightArrowClick = () => {
    if (innerBoxRef.current) {
      innerBoxRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  const handleTaskComplete = async (taskId) => {
    try {
      // Send a request to mark the task as completed
      await axios.put(
        `http://localhost:5000/api/taskManagement/tasks/task/${taskId}/complete`
      );

      // Update the task list by filtering out the completed task
      setUpcomingTasks((prevTasks) =>
        prevTasks.filter((task) => task._id !== taskId)
      );
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  return (
    <div className="wrapper">
      <h1>Hello Fardeen</h1>
      <div className="outerBox">
        <div className="innerBox" ref={innerBoxRef}>
          {debtRelations.map((relation, index) => (
            <Card key={index}>
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div className="d-flex">
                    <Avatar
                      style={{ width: "4rem", height: "4rem" }}
                      {...genConfig(relation.email)}
                    />
                    <div className="ms-2">
                      <h3 className="my-0">{relation.username}</h3>
                      <div>
                        <p>{relation.email}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="ms-3 text-secondary">
                      {relation.amount < 0 ? "You owe" : "Owes you"}
                    </div>
                    <h5
                      className={`fw-bold ${
                        relation.amount < 0 ? "text-danger" : "text-success"
                      }`}
                    >
                      ${Math.abs(relation.amount).toFixed(2)}
                    </h5>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>

        {showLeftArrow && (
          <div className="btnBox leftBtnBox" onClick={handleLeftArrowClick}>
            <img
              src={RightArrowSvg}
              className="btn leftBtn"
              style={{ transform: "rotate(180deg)" }}
              alt="Left Arrow"
            />
          </div>
        )}
        {showRightArrow && (
          <div className="btnBox rightBtnBox" onClick={handleRightArrowClick}>
            <img
              src={RightArrowSvg}
              className="btn rightBtn"
              alt="Right Arrow"
            />
          </div>
        )}
      </div>

      <div className="outerBox2">
        <div className="taskBox">
          <div className="innerBox2">
            {/* Display upcoming tasks */}
            {upcomingTasks.map((task, index) => (
              <Card key={index} className="mt-3">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h3 className="my-0">{task.taskName}</h3>
                      <p className="mb-1">{task.description}</p>
                      <p className="mb-0">{task.formattedDeadline}</p>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => handleTaskComplete(task._id)}
                    >
                      Complete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>

        <div className="rewardBox">
          <div className="d-flex justify-content-end">
            <div className="d-flex align-self-end">
              <h6>{`Max Streak: ${streakInfo.maxStreak}`}</h6>
            </div>
          </div>

          <div className="d-flex flex-column align-items-center">
            {streakInfo.currentStreak >= 3 ? (
              <img
                src={StreakPng}
                className="mx-2 my-3 img-fluid"
                style={{ width: "150px", height: "150px" }}
                alt="Streak"
              />
            ) : (
              <img
                src={NoStreakPng}
                className="mx-2 my-3 img-fluid"
                style={{ width: "150px", height: "150px" }}
                alt="Streak"
              />
            )}
            <div className="d-flex">
              {streakInfo.currentStreak >= 1 ? (
                <img
                  src={CheckPng}
                  className="mx-2"
                  style={{ width: "25px", height: "25px" }}
                  alt="Streak"
                />
              ) : (
                <img
                  src={CirclePng}
                  className="mx-2"
                  style={{ width: "25px", height: "25px" }}
                  alt="Streak"
                />
              )}
              {streakInfo.currentStreak >= 2 ? (
                <img
                  src={CheckPng}
                  className="mx-2"
                  style={{ width: "25px", height: "25px" }}
                  alt="Streak"
                />
              ) : (
                <img
                  src={CirclePng}
                  className="mx-2"
                  style={{ width: "25px", height: "25px" }}
                  alt="Streak"
                />
              )}
              {streakInfo.currentStreak >= 3 ? (
                <img
                  src={CheckPng}
                  className="mx-2"
                  style={{ width: "25px", height: "25px" }}
                  alt="Streak"
                />
              ) : (
                <img
                  src={CirclePng}
                  className="mx-2"
                  style={{ width: "25px", height: "25px" }}
                  alt="Streak"
                />
              )}
            </div>
            <div className="d-flex flex-column align-items-center">
              <h2 className="">
                {streakInfo.currentStreak >= 3
                  ? `${streakInfo.currentStreak} chores streak!`
                  : ""}
              </h2>
              <h4>
                {streakInfo.currentStreak >= 3
                  ? "You're on a roll! Keep the streak going!"
                  : "Complete 3 tasks on time to start a streak!"}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="outerBox3">
        <div className="innerBox3">
          <Card style={{ width: "6rem" }}>
            <Card.Body>
              <Card.Title>Groups</Card.Title>
              <Button href="/taskManagement" variant="primary">
                Go somewhere
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>

      <div className="outerBox3">
        <div className="innerBox3">
          <Card style={{ width: "6rem" }}>
            <Card.Body>
              <Card.Title>Groups</Card.Title>
              <Button href="/account/group" variant="primary">
                Go somewhere
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default HomePageSlider;
