# Chatbot
You can integrate this chatbot into your website and ask questions about your documents in your Pinecone index.

## Installation Backend service

  ### I - Using an IDE : 

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
Here is how you find the needed information:
  #### AZURE_OPENAI_API_KEY :

![image](https://github.com/etienne113/Chatbot/assets/96786848/64ae1de5-46b5-4c7d-9d43-3215710a43d5)

<img width="526" alt="image" src="https://github.com/etienne113/Chatbot/assets/96786848/81c182c9-456a-4740-8dab-437aa72a9c79">

There you can copy any of the two keys .

  #### AZURE_OPENAI_ENDPOINT :

  ![image](https://github.com/etienne113/Chatbot/assets/96786848/b884d33a-e76c-4f23-a5a9-e0449dbd508a)

  #### AZURE_SEARCH_KEY : 
  
  ![image](https://github.com/etienne113/Chatbot/assets/96786848/607c04fa-0c27-46da-9468-778889d7a85f)

  <img width="416" alt="image" src="https://github.com/etienne113/Chatbot/assets/96786848/7eccc1ee-0631-4395-803c-43a9a4140942">

  #### AZURE_COGNITIVE_SEARCH_INDEX_NAME :

    Copy the name of your Azure Search Index, in this case 'searchserviceke':

  <img width="368" alt="image" src="https://github.com/etienne113/Chatbot/assets/96786848/28aded0b-24fc-4661-9e0b-b2625c985a04">
    
  #### AZURE_SEARCH_ENDPOINT :

  ![image](https://github.com/etienne113/Chatbot/assets/96786848/81f7cbba-2009-49d2-be67-369184352825)

  #### SEARCH_INDEX_NAME :

  <img width="476" alt="image" src="https://github.com/etienne113/Chatbot/assets/96786848/c1b1d474-8722-4375-89cc-9b900a2d11fc">


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
    python3 app.py
```
## Hinweis:
  You can execute the same commands in a terminal you don't necessarily have to download an IDE, 
  you just have to make sure to be in the right folder front- or backend.
  
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
