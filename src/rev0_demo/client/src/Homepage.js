import React, { useRef, useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import RightArrowSvg from "./images/right_arrow.png";
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

  return (
    <div className="wrapper">
      <h1>Hello Fardeen</h1>
      <div className="outerBox">
        <div className="innerBox" ref={innerBoxRef}>
          {debtRelations.map((relation, index) => (
            <Card key={index} style={{}}>
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div className="d-flex">
                    <Avatar
                      style={{ width: "4rem", height: "4rem" }} // Adjust the width and height as needed
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
            <Card style={{ width: "6rem" }}>
              {/* <Card.Img variant="top" src={groupImg} /> */}
              <Card.Body>
                <Card.Title>Groups</Card.Title>
                <Button href="/account/group" variant="primary">
                  Go somewhere
                </Button>
              </Card.Body>
            </Card>
            <Card style={{ width: "6rem" }}>
              {/* <Card.Img variant="top" src={taskImg} /> */}
              <Card.Body>
                <Card.Title>Tasks</Card.Title>
                <Button href="/taskManagement" variant="primary">
                  Go somewhere
                </Button>
              </Card.Body>
            </Card>
            <Card style={{ width: "6rem" }}>
              {/* <Card.Img variant="top" src={scheduleImg} /> */}
              <Card.Body>
                <Card.Title>Schedules</Card.Title>
                <Button href="/Scheduling" variant="primary">
                  Go somewhere
                </Button>
              </Card.Body>
            </Card>
            <Card style={{ width: "6rem" }}>
              {/* <Card.Img variant="top" src={billImg} /> */}
              <Card.Body>
                <Card.Title>Bills</Card.Title>
                <Button href="/billManagement" variant="primary">
                  Go somewhere
                </Button>
              </Card.Body>
            </Card>
          </div>
        </div>
        <div className="rewardBox">
          <Card style={{ width: "6rem" }}>
            {/* <Card.Img variant="top" src={groupImg} /> */}
            <Card.Body>
              <Card.Title>Groups</Card.Title>
              <Button href="/account/group" variant="primary">
                Go somewhere
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
      <div className="outerBox3">
        <div className="innerBox3">
          <Card style={{ width: "6rem" }}>
            {/* <Card.Img variant="top" src={groupImg} /> */}
            <Card.Body>
              <Card.Title>Groups</Card.Title>
              <Button href="/account/group" variant="primary">
                Go somewhere
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
      <div className="outerBox3">
        <div className="innerBox3">
          <Card style={{ width: "6rem" }}>
            {/* <Card.Img variant="top" src={groupImg} /> */}
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
