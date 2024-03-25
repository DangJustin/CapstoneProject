import React, { useRef, useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import RightArrowSvg from "./images/arrow_white.png";
import CirclePng from "./images/circle.png";
import CheckPng from "./images/circle_check.png";
import StreakPng from "./images/streak.png";
import NoStreakPng from "./images/no_streak.png";
import CompletePng from "./images/check.png";
import axios from "axios";
import Avatar, { genConfig } from "react-nice-avatar";
import Sidebar from "./Sidebar";

const auth = getAuth();

function HomePage() {
  const innerBoxRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [debtRelations, setDebtRelations] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
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
    const fetchUserInfo = async () => {
      try {
        if (!currentUser) {
          return;
        }

        // Make a GET request to the route to grab current user info
        const response = await axios.get(
          `http://localhost:5000/api/database/user/${currentUser.uid}`
        );

        if (!response) {
          console.error("Failed to fetch user data");
          return;
        }

        setUserInfo(response.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    // Call the fetchUserInfo function
    fetchUserInfo();
  }, [currentUser]);

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
      } catch (error) {
        console.error("Error fetching streak information:", error);
      }
    };

    if (currentUser) {
      fetchStreakInfo();
    }
  }, [currentUser, upcomingTasks]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userGroupsResponse = await axios.get(
          `http://localhost:5000/api/database/user-groups/${currentUser.uid}`
        );
        const groups = userGroupsResponse.data;

        const eventsPromises = groups.map((group) =>
          axios.get(
            `http://localhost:5000/api/scheduling/group/${group._id}/events`
          )
        );

        const eventsResponses = await Promise.all(eventsPromises);
        const allEvents = eventsResponses.flatMap((response) => response.data);

        const currentDateTime = new Date();
        const upcomingEvents = allEvents.filter(
          (event) => new Date(event.enddatetime) > currentDateTime
        );
        upcomingEvents.sort(
          (a, b) => new Date(a.datetime) - new Date(b.datetime)
        );
        setEvents(upcomingEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    if (currentUser) {
      fetchEvents();
    }
  }, [currentUser]);

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

    const innerBox = innerBoxRef.current;

    if (innerBox) {
      innerBox.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (innerBox) {
        innerBox.removeEventListener("scroll", handleScroll);
      }
    };
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
    <div>
      <Sidebar />
      {/* Render the toggle button */}

      <div className="homepage set-font">
        <div className="wrapper">
          <div className="greeting d-flex flex-row">
            <h1>Hello {userInfo.username}</h1>
          </div>
          <div className="d-flex flex-row">
            <div className="outerBox">
              <div className="innerBox" ref={innerBoxRef}>
                {debtRelations.map((relation, index) => (
                  <Card key={index} className="cardView card-custom">
                    <Card.Body>
                      <div className="d-flex justify-content-between">
                        <div className="d-flex">
                          <Avatar
                            style={{ width: "4rem", height: "4rem" }}
                            {...genConfig(relation.email)}
                          />
                          <div className="ms-2">
                            <h3 className="my-0 username">
                              {relation.username}
                            </h3>
                            <div>
                              <p className="useremail">{relation.email}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-secondary">
                            <span className="userOweText">
                              {relation.amount < 0 ? "You owe" : "Owes you"}
                            </span>
                          </div>
                          <h5
                            className={`fw-bold userAmount ${
                              relation.amount < 0
                                ? "userAmount-danger"
                                : "userAmount-success"
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
                <div
                  className="btnBox leftBtnBox"
                  onClick={handleLeftArrowClick}
                >
                  <img
                    src={RightArrowSvg}
                    className="btn leftBtn"
                    style={{ transform: "rotate(180deg)" }}
                    alt="Left Arrow"
                  />
                </div>
              )}
              {showRightArrow && (
                <div
                  className="btnBox rightBtnBox"
                  onClick={handleRightArrowClick}
                >
                  <img
                    src={RightArrowSvg}
                    className="btn rightBtn"
                    alt="Right Arrow"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="outerBox2">
            <div className="taskBox">
              {/* Display upcoming tasks */}
              <h4 className="my-2 mx-3 choreText">Chores for the week</h4>
              {upcomingTasks.map((task, index) => (
                <Card key={index} className="mt-3 mb-3 mx-3  card-custom">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h3 className="my-0">{task.taskName}</h3>
                        <p className="mb-1">{task.description}</p>
                        <p className="mb-0">{task.formattedDeadline}</p>
                      </div>
                      <button
                        className="btnCheck my-auto"
                        onClick={() => {
                          handleTaskComplete(task._id);
                        }}
                      >
                        <img
                          src={CompletePng}
                          alt="Complete Task"
                          style={{
                            width: "30px",
                            height: "30px",
                          }}
                        />
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>

            <div className="rewardBox">
              <div className="d-flex justify-content-end">
                <div className="d-flex align-self-end">
                  <h6 className="text-white">{`Max Streak: ${streakInfo.maxStreak}`}</h6>
                </div>
              </div>

              <div className="d-flex flex-column align-items-center">
                {streakInfo.currentStreak >= 3 ? (
                  <img
                    src={StreakPng}
                    className="mx-2 my-3 img-fluid streakImage"
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
                  <h2 className="text-white fs-2">
                    {streakInfo.currentStreak >= 3
                      ? `${streakInfo.currentStreak} chores streak!`
                      : ""}
                  </h2>
                  <h4 className="text-white streakText">
                    {streakInfo.currentStreak >= 3
                      ? "You're on a roll! Keep the streak going!"
                      : "Complete 3 tasks on time to start a streak!"}
                  </h4>
                </div>
              </div>
            </div>
          </div>
          <div className="outerBox3">
            <h3 className="eventsText">Upcoming events</h3>
            <div className="innerBox3 d-flex flex-wrap justify-content-center">
              {events.slice(0, 3).map((event, index) => (
                <div key={index} className="card eventCard card-custom">
                  <div className="card-body">
                    <div className="ms-3 mb-4">
                      <div className="display-4">
                        {new Date(event.datetime).toLocaleDateString("en-US", {
                          day: "2-digit",
                        })}
                      </div>
                      <div className="fs-6">
                        {new Date(event.datetime).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </div>
                    </div>
                    <div className="ms-3 mt-5">
                      <h5 className="card-title fw-bold mt-5">
                        {event.eventname}
                      </h5>
                    </div>
                    <div>
                      <p className="card-text ms-3 mb-0">
                        {new Date(event.datetime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })}{" "}
                        -{" "}
                        {new Date(event.enddatetime).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
