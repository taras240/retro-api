
# RetroAPI Tracker

*This web application is designed to track achievements obtained in retro games using the open API from retroachievements.org.*

![зображення](https://github.com/user-attachments/assets/9ca167a4-d5eb-450d-84df-0dd8129ce8cb)


![image](https://github.com/taras240/retro-api/assets/41308277/3340c91e-18b3-4053-b220-cba2c30a5f4c)


### How it works

- Upon first launch, you need to enter your login and API key in the "Login" section.
- The program sends a getUserProfile request to the API, and if such a user exists, it considers the data valid and stores it in the local storage.
- When you press the auto-update button, the program sends a getGameInfoAndUserProgress request and retrieves all achievements for the last launched game. Afterward, every 5 seconds a getUserProfile request is sent, and if TotalPoins or SoftcorePoints is mismatched, it get last achivs for 5 mins and refresh widgets.
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

1. **Launch** the application in your web browser (https://retrocheevos.vercel.app).
2. **Enter** your API_key and username to access your account on RetroAchievements.org.
3. **Choose** the game for which you want to track achievements.
4. **View** the list of achievements and track their progress.

### Installation

The application does not require installation; you can simply navigate to the link and start using it.


### Feedback

If you have any questions, comments, or suggestions, please contact me *https://discord.gg/apzc6kCAbH* | *khomyn@outlook.com*  or open a new issue in the Issues section on GitHub.
