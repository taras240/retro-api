config = new Config();
const apiWorker = new APIWorker();
const ui = new UI();



const submitRAData = () => {
  let userName = ui.content.querySelector("#login_user-name").value.toLowerCase();
  let apiKey = ui.content.querySelector("#login__api-key").value;
  apiWorker
    .verifyUserIdent({ userName: userName, apiKey: apiKey })
    .then((userObj) => {
      if (!userObj.ID) {
        config.identConfirmed = false;
        const submitButton = ui.content.querySelector("#login__submit-button");
        submitButton.classList.add("error");
        submitButton.classList.remove("verified");

      }
      else {
        updateLogin({
          userName: userName,
          apiKey: apiKey,
          userObj: userObj,
        });
        ui.goto.home();
        // ui.statusPanel.watchButton.click();
      }
    });

}
const updateLogin = ({ userName, apiKey, userObj }) => {
  config.USER_NAME = userName;
  config.API_KEY = apiKey;
  config.identConfirmed = true;
  config.userImageSrc = `https://media.retroachievements.org${userObj?.UserPic}`;
  const submitButton = ui.content.querySelector("#login__submit-button");
  submitButton.classList.remove("error");
  submitButton.classList.add("verified");
}