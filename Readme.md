Make sure to start in the directory Tapawingohike_app.

To install all necessary dependencies you need to run the command 'Npm i' (npm install)

To start this project run 'npx expo start'

Next have an emulator running or a real deviced connect by USB to the computer.

Select the option to run the program (a for Android) or scan the QR code on the Expo Go app.

To run the tests you can input 'npm test'

To run static code analysis using ESLint this is possible with the command 'npx eslint .' or 'npx eslint . --quiet' if you only want to display errors.

If you are running the backend locally and want to connect the project you need to you need to change the value in the .env file of EXPO_PUBLIC_API_IP_ADDRESS to the ipaddres of your computer on the network.
The EXPO_PUBLIC_API_PORT should stay on 8080. (Connection to the backend is not yet implemented but these instructions are for when/if it is)
