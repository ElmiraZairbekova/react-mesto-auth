import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

// Компоненты
import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import EditProfilePopup from "./EditProfilePopup";
import ImagePopup from "./ImagePopup";
import AddPlacePopup from "./AddPlacePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import api from "../utils/api";
import Login from "./Login";
import Register from "./Register";
import ProtectedRoute from "./ProtectedRoute";
import InfoTooltip from "./InfoTooltip";
import * as auth from "../utils/auth";

// Стили
import "../index.css";

function App() {
  // Хуки
  const navigate = useNavigate();
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [isProfilePopupOpened, setIsProfilePopupOpened] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState({
    name: "Загрузка",
    about: "Загрузка",
  });
  const [cards, setCards] = useState([]);

  const [isLogIn, setIsLogIn] =
    useState(false); /* [isLoggedIn, setIsLoggedIn] */
  const [emailName, setEmailName] = useState(null);
  const [popupTitle, setPopupTitle] = useState("");
  const [infoTooltip, setInfoTooltip] = useState(false);

  const isOpen =
    isProfilePopupOpened ||
    isEditAvatarPopupOpen ||
    isEditProfilePopupOpen ||
    isAddPlacePopupOpen ||
    isImagePopupOpen ||
    infoTooltip;

  useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([user, cards]) => {
        setCurrentUser(user);
        setCards(cards);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  function handleLogin /* onLogin */(email, password) {
    auth
      .loginUser(email, password)
      .then((res) => {
        localStorage.setItem("jwt", res.token);
        setIsLogIn(true);
        setEmailName(email);
        navigate("/");
      })
      .catch(() => {
        setPopupTitle("Что-то пошло не так! Попробуйте ещё раз.");
        handleInfoTooltip();
      });
  }

  function handleRegister /* onRegister */(email, password) {
    auth
      .registerUser(email, password)
      .then(() => {
        setPopupTitle("Вы успешно зарегистрировались!");
        navigate("/sign-in");
      })
      .catch(() => {
        setPopupTitle("Что-то пошло не так! Попробуйте ещё раз.");
      })
      .finally(handleInfoTooltip);
  }

  function logOut /* onSignOut */() {
    setIsLogIn(false);
    setEmailName(null);
    navigate("/sign-in");
    localStorage.removeItem("jwt");
  }

  function handleInfoTooltip() {
    setInfoTooltip(true);
  }

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      auth
        .getToken(jwt)
        .then((res) => {
          if (res) {
            setIsLogIn(true);
            setEmailName(res.data.email);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  useEffect(() => {
    if (isLogIn === true) {
      navigate("/");
    }
  }, [isLogIn, navigate]);

  useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([user, cards]) => {
        setCurrentUser(user);
        setCards(cards);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  function handleUpdateUser(data) {
    setIsLoading(true);
    api
      .updateUserInfo(data)
      .then((res) => {
        setCurrentUser(res);
      })
      .then(() => closeAllPopups())
      .catch((e) => console.warn(e))
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);

    if (!isLiked) {
      api
        .addCardLike(card._id)
        .then((newCard) => {
          setCards((state) =>
            state.map((c) => (c._id === card._id ? newCard : c))
          );
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      api
        .deleteCardLike(card._id)
        .then((newCard) => {
          setCards((state) =>
            state.map((c) => (c._id === card._id ? newCard : c))
          );
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  function handleCardDelete(card) {
    api
      .removeCard(card)
      .then(() => {
        setCards((items) => items.filter((c) => c._id !== card._id && c));
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function handleAddPlaceSubmit(data) {
    setIsLoading(true);
    api
      .addNewCard(data)
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
    setIsImagePopupOpen(true);
  }

  function handlePopupCloseClick(evt) {
    if (evt.target.classList.contains("popup")) {
      closeAllPopups();
    }
  }

  function handleAvatarUpdate(data) {
    setIsLoading(true);
    api
      .updateProfileAvatar(data)
      .then((newAvatar) => {
        setCurrentUser(newAvatar);
        closeAllPopups();
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsImagePopupOpen(false);
    setSelectedCard({});
    setInfoTooltip(false);
  }

  useEffect(() => {
    if (isOpen) {
      function handleEsc(evt) {
        if (evt.key === "Escape") {
          closeAllPopups();
        }
      }

      document.addEventListener("keydown", handleEsc);

      return () => {
        document.removeEventListener("keydown", handleEsc);
      };
    }
  }, [isOpen]);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="root">
        <Routes>
          <Route
            path="/sign-in"
            element={
              <>
                <Header title="Регистрация" route="/sign-up" />
                <Login handleLogin={handleLogin} />
              </>
            }
          />

          <Route
            path="/sign-up"
            element={
              <>
                <Header title="Войти" route="/sign-in" />
                <Register onRegister={handleRegister} />
              </>
            }
          />
          <Route
            exact
            path="/"
            element={
              <>
                <Header
                  title="Выйти"
                  mail={emailName}
                  onClick={logOut}
                  route=""
                />
                <ProtectedRoute
                  component={Main}
                  isLog={isLogIn}
                  onEditProfile={handleEditProfileClick}
                  onAddCard={handleAddPlaceClick}
                  onEditAvatar={handleEditAvatarClick}
                  onCardClick={handleCardClick}
                  cards={cards}
                  onCardLike={handleCardLike}
                  onCardDelete={handleCardDelete}
                />
                <Footer />
              </>
            }
          />
          <Route
            path="*"
            element={<Navigate to={isLogIn ? "/" : "/sign-in"} />}
          />
        </Routes>
        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          isLoading={isLoading}
          onSubmit={handleUpdateUser}
          onCloseClick={handlePopupCloseClick}
        />

        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onCloseClick={handlePopupCloseClick}
          onClose={closeAllPopups}
          isLoading={isLoading}
          onAddSubmit={handleAddPlaceSubmit}
        />

        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onCloseClick={handlePopupCloseClick}
          onClose={closeAllPopups}
          onSubmit={handleAvatarUpdate}
          isLoading={isLoading}
        />

        <ImagePopup
          card={selectedCard}
          onClose={closeAllPopups}
          isOpen={isImagePopupOpen}
          onCloseClick={handlePopupCloseClick}
        />
        <InfoTooltip
          title={popupTitle}
          isOpen={infoTooltip}
          onCloseClick={handlePopupCloseClick}
          onClose={closeAllPopups}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
