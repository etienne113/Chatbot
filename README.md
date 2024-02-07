# Chatbot
You can integrate this chatbot into your website and ask questions about your documents in your Pinecone index.

## Installation Backend service

1- Clone this git repository by running the command: 
```shell
  git clone https://github.com/etienne113/Chatbot.git
```
  
2- Open the folder 'backend' in a IDE of your choice, we recommand PyCharm

  Click of this link to download the PyCharm IDE: https://www.jetbrains.com/pycharm/download/?section=windows#section=windows
  
3- Open the terminal in Pycharm: 

  ![image](https://github.com/etienne113/chainlitUploadToPinecone/assets/96786848/7f313354-27f0-4f6e-934c-51815132ea60)
  
4- Download and install  Python (if not already installed) : visit the website https://www.python.org/downloads/

5- run the command:
  ```shell
   python -m venv venv
  ```
And then:
  * On Windows:
    ```shell
      . venv/Scripts/activate
    ```
  * On MacOS:
    ```shell
      . venv/bin/activate
    ```
6- Now install the required dependencies by running the command:
```shell
  pip install -r requirements.txt
```
7- Create a .env file from the .env.example file by running the command:
  ```shell
    cp .env.example .env
  ```
and then fill the empty fields.

This Link below will direct you to the xata Serverless database platform:

https://xata.io/

 a- Create an account.
 
 b- At the startpage , click on settings at the left on your screen and copy your XATA_API_KEY.
 
 b- Create a database :
 
 ![image](https://github.com/etienne113/Chatbot/assets/96786848/ac7a9db3-7007-4d3f-a618-5a0413d232b5)
 
 c- Find your XATA_API_KEY by holding your mouse on your database and then clicking on the appeared settings icon.
 
 There you can now copy your XATA_URI.
 
8- Now you can run your programm by running the command:
```shell
    . venv/bin/activate
```
or sometimes :
```shell
   source . venv/bin/activate
```
and then: 
```shell
    python api.py
```

## Installation Frontend Service:

1- Open the folder 'frontend' in an IDE of your choice, we recommend WebStorm:
 Click of this link to download the WebStorm IDE:   https://www.jetbrains.com/webstorm/

 2- You need to install Node.js:
 
 https://nodejs.org/en/download
 <img width="1266" alt="image" src="https://github.com/etienne113/Chatbot/assets/96786848/4643ae60-1234-4e16-a655-bb370cd28896">
 
 3- Run these commands in your WebStorm Terminal:
 
```shell
  npm install serverless-dotenv-plugin --save-dev   
```
```shell
    npm install express multer cors    
```
```shell
  npm install form-data 
```
```shell
  npm install axios
```
2- Now open the terminal down on the left corner and then paste this command:

```shell
    node server.js
```

  Thank you for the visit! 
