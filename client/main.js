import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(params) {
  params.textContent = '';
  loadInterval = setInterval(() => {
    params.textContent += '.';
    if(params.textContent === '....'){
      params.textContent = '';
    }
  }, 300);
}

function typeText(params, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      params.innerHTML += text.chartAt(index);
      index++;
    }else{
      clearInterval(interval);
    }
  }, 20);
}


function generateUniqueId() {
  var timestamp = Date.now();
  var randomNumber = Math.random();
  var hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
    `
  )
}

const handleSumbit = async(e) =>{
  e.preventDefault();
  const data = new FormData(form);

  //user chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  //bot chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // fetch data from server -> bot response
  const response = await fetch('https://codex-im0y.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';
  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

    typeText(messageDiv, parsedData)
  } else {
    const err = await response.text()

    messageDiv.innerHTML = "Something went wrong"
    alert(err)
  }
  
}

form.addEventListener('submit', handleSumbit);

form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSumbit(e);
  }
});
