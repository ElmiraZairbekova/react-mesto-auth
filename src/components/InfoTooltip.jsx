import success from "../images/success.svg";
import fail from "../images/wrong.svg";

function InfoTooltip(props) {
  return (
    <div
      className={`popup ${props.isOpen ? "popup_active" : ""}`}
      onClick={props.onCloseClick}
    >
      <div className="popup__tooltip">
        <img
          className="popup__tooltip-img"
          src={props.isLogIn ? success : fail }
          alt="Попап с информацией"
        />
        <h2 className="popup__tooltip-title">{props.title}</h2>
        <button
          className="popup__close"
          type="button"
          title="Закрыть"
          onClick={props.onClose}
        />
      </div>
    </div>
  );
}

export default InfoTooltip;
