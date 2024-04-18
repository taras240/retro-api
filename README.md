
# RetroAPI Tracker

*This web application is designed to track achievements obtained in retro games using the open API from retroachievements.org.*

![image](https://github.com/taras240/retro-api/assets/41308277/973beba6-b37d-4a52-abdb-9d6434d70b14)







### How it works

- Upon first launch, you need to enter your login and API key in the "Login" section.
- The program sends a getUserProfile request to the API, and if such a user exists, it considers the data valid and stores it in the local storage.
- When you press the auto-update button, the program sends a GetGameInfoAndUserProgress request and retrieves all achievements for the last launched game. Afterward, every 5 seconds, a GetUserRecentAchievements request is sent, and unlocked achievements for the past 5 minutes are received. If there are any achievements that are not updated, they are refreshed. Additionally, the progress bar and reward section are updated.

### Features

- Retrieval of game progress and user achievements information via the API.
- Main information about game.
- Viewing the list of game achievements.
- Automatic updating of achievements and game progress.
- Custom achievement targets section.
- Flexible sorting for achievements.

### Requirements

Before using the application, make sure the following software is installed on your device:

- **A modern web browser** (recommended: Google Chrome, Mozilla Firefox, or Safari).
- **Internet connection**.

### Usage Instructions

1. **Launch** the application in your web browser (https://taras240.github.io/retro-api).
2. **Enter** your API_key and username to access your account on RetroAchievements.org.
3. **Choose** the game for which you want to track achievements.
4. **View** the list of achievements and track their progress.

### Installation

The application does not require installation; you can simply navigate to the link and start using it.


### Feedback

If you have any questions, comments, or suggestions, please contact me *khomyn@outlook.com* or open a new issue in the Issues section on GitHub.
