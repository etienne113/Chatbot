const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = `
                <button class="chatbot-toggler">
                    <span class="material-symbols-rounded">mode_comment</span>
                    <span class="material-symbols-outlined">close</span>
                </button>
                <div class="chatbot">
                    <header>
                        <h2>Chat</h2>
                        <span class="close-btn material-symbols-outlined">close</span>
                    </header>
                    <ul class="chatbox">
                        <li class="chat incoming">
                            <span class="material-symbols-outlined">psychology</span>
                            <p>Hi there!<br>First of all, you need to choose your orgunit 👇🏾</p>
                        </li>
                        <br>
                        <li class="chat incoming">
                            <span class="material-symbols-outlined">psychology</span>
                            <p><input type="radio" name="options" id="management">  Management <br><input type="radio" name="options" id="personal">  Personal </p>
                        </li>
                    </ul>
                    <div class="chat-input">
                        <label>
                            <textarea placeholder="Looking forward to your question..." spellcheck="false" required></textarea>
                        </label>
                        <span id="send-btn" class="material-symbols-rounded">send</span>
                    </div>
                </div>
    `;
    // Create and append link elements for stylesheets
    const styleSheet1 = document.createElement('link');
    styleSheet1.rel = 'stylesheet';
    styleSheet1.href = 'https://etienne113.github.io/chatFlow.github.io/style.css';
    document.head.appendChild(styleSheet1);

    const styleSheet2 = document.createElement('link');
    styleSheet2.rel = 'stylesheet';
    styleSheet2.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0';
    document.head.appendChild(styleSheet2);

    const styleSheet3 = document.createElement('link');
    styleSheet3.rel = 'stylesheet';
    styleSheet3.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@48,400,1,0';
    document.head.appendChild(styleSheet3);

    // Create and append meta element for viewport settings
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(viewportMeta);


    const chatbotToggler = container.querySelector('.chatbot-toggler');
    const closeBtn = container.querySelector('.close-btn');
    const chatbox = container.querySelector('.chatbox');
    const chatInput = container.querySelector('.chat-input textarea');
    const sendChatBtn = container.querySelector('#send-btn');
    let userMessage = null;
    const inputInitHeight = chatInput.scrollHeight;

    const createChatLi = (message, className) => {
        // Create a chat <li> element with passed message and className
        const chatLi = document.createElement('li');
        chatLi.classList.add('chat', `${className}`);
        chatLi.innerHTML = className === 'outgoing' ? '<p></p>' : '<span class="material-symbols-outlined">psychology</span><p></p>';
        chatLi.querySelector('p').textContent = message;
        return chatLi; // return chat <li> element
    };

    const createLoader = () => {
        const loader = document.createElement('div');
        loader.classList.add('loader');
        return loader;
    };

    let selectedOption;

    function updateSelectedOption() {
        const options = document.getElementsByName('options');
        for (let i = 0; i < options.length; i++) {
            if (options[i].checked) {
                selectedOption = options[i].id;
                break;
            }
        }
    }

function generateTabId(userId) {
    return `${userId}_${Math.random().toString(36).substring(2, 15)}`;
}
function notifyServerAboutNewTab(chatElement) {

    const userId = 'user-1';
    let chatId = window.name;

    if (!chatId) {
        chatId = generateTabId(userId);
        window.name = chatId;
    }
    const formData = new FormData();
    const API_URL = 'http://localhost:3000/get-answer'; // TODO : change the endpoint
    const messageElement = chatElement.querySelector('p');

    const loader = createLoader();
    chatbox.appendChild(loader);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    formData.append('user_message', userMessage);
    formData.append('orgunit', selectedOption);
    formData.append('mode', 'cors');
    formData.append('user_id', userId);
    formData.append('chatId', chatId);

    const requestOptions = {
      /*  headers: {
                'Content-Type': 'multipart/form-data',
                "Authorization": `Bearer ${'BACKEND_ACCESS_API_KEY'}`,
                'User_message': userMessage,
            },*/
        method: 'POST',
        body: formData,
    };

    fetch(API_URL, requestOptions)
        .then(res => res.json())
        .then(r => {
            if(r.error){
                messageElement.classList.add('error');
                messageElement.textContent = r.error;
            }
            else if(r.success)
                messageElement.textContent = r.success.trim();
        })
        .catch(error => {
            messageElement.classList.add('error');
            messageElement.textContent = error;
        })
        .finally(() => {
            // Remove the loader after receiving the response
            chatbox.removeChild(loader);
            chatbox.scrollTo(0, chatbox.scrollHeight);
        });

}
function handleReturnToOpenedTab() {
    const userId = 'your_user_id';
    const chatId = localStorage.getItem('chatId');
    const storedData = localStorage.getItem(chatId);
    if (storedData) {
        console.log('User returned to the first tab. Stored data:', JSON.parse(storedData));
    }
    fetch('/new-tab', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId,
            chatId,
        }),
    });
}


window.addEventListener('focus', notifyServerAboutNewTab);
//window.addEventListener('focus', handleReturnToOpenedTab);

const handleChat = () => {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // Clear the input textarea and set its height to default
        chatInput.value = '';
        chatInput.style.height = `${inputInitHeight}px`;

        // Append the user's message to the chatbox
        chatbox.appendChild(createChatLi(userMessage, 'outgoing'));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        setTimeout(() => {
            // Display "Thinking..." message while waiting for the response
            const incomingChatLi = createChatLi('Thinking...', 'incoming');
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            updateSelectedOption();
            //generateResponse(incomingChatLi);
            notifyServerAboutNewTab(incomingChatLi);
        }, 600);
    };

    chatInput.addEventListener('input', () => {
        // Adjust the height of the input textarea based on its content
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener('keydown', (e) => {
        // If Enter key is pressed without Shift key and the window
        // width is greater than 800px, handle the chat
        if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });

    sendChatBtn.addEventListener('click', handleChat);
    closeBtn.addEventListener('click', () => document.body.classList.remove('show-chatbot'));
    chatbotToggler.addEventListener('click', () => {
        document.body.classList.toggle('show-chatbot');

        // Additional animation logic for the toggler
        const rotateDeg = document.body.classList.contains('show-chatbot') ? 90 : 0;
        chatbotToggler.style.transform = `rotate(${rotateDeg}deg)`;
    });
