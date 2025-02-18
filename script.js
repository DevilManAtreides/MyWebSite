document.addEventListener("DOMContentLoaded", () => {
    const typingText = document.getElementById("typing-text")
    const continuePrompt = document.getElementById("continue-prompt")
    const messages = [
      "[Fetching date and time...]", // Placeholder for the date, time, and timezone
      "Initializing system...",
      "Connecting to server",
      "Establishing secure connection...",
      "Success!",
      "Analysing user",
      "Decrypting user credentials...",
      "Access granted.",
      "Welcome, [Fetching IP...].",
      "Loading systems...",
      "System ready.",
    ]

  
    let messageIndex = 0
    let charIndex = 0
    let animationTriggered = false // Flag to track if animation has been triggered
  
    let dateTime = null
    let ipAddress = null
  
    // Function to get the visitor's date, time, and timezone
    function getDateTime() {
      const now = new Date()
      const date = now.toLocaleDateString()
      const time = now.toLocaleTimeString()
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      return `${time} ${date}  (${timezone})`
    }

    async function fetchIP() {
        try {
          const response = await fetch("https://api.ipify.org?format=json")
          const data = await response.json()
          return data.ip
        } catch (error) {
          console.error("Error fetching IP:", error)
          return "Unknown"
        }
      }

       // Function to update the welcome message with the visitor's IP
  function updateWelcomeMessage() {
    const welcomeIndex = messages.findIndex((msg) =>
      msg.includes("[Fetching IP...]"),
    )
    if (welcomeIndex !== -1) {
      messages[welcomeIndex] =
        `Welcome, <span class="ip-address">${ipAddress}</span>.\n`
    }
  }

  // Function to update the date and time message
  function updateDateTimeMessage() {
    const dateTimeIndex = messages.findIndex((msg) =>
      msg.includes("[Fetching date and time...]"),
    )
    if (dateTimeIndex !== -1) {
      messages[dateTimeIndex] =
        `System time: <span class="ip-address">${dateTime}</span>\n`
    }
  }

  // Function to update the top status bar with IP and date/time
  function updateTopStatusBar() {
    const welcomeMessageEl = document.getElementById("welcome-message")
    const dateTimeEl = document.getElementById("date-time")

    if (welcomeMessageEl && ipAddress) {
      welcomeMessageEl.innerHTML = `Welcome, User <span class="ip-address">[${ipAddress}]</span>`
    }

    if (dateTimeEl && dateTime) {
      dateTimeEl.textContent = dateTime
    }
  }

  function animateLoadingBar() {
    const loadingBarLength = 20
    let progress = 0

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (progress <= loadingBarLength) {
          const filled = "❚".repeat(progress)
          const empty = " ".repeat(loadingBarLength - progress)
          typingText.innerHTML =
            typingText.innerHTML.replace(/\[.*\] \d+%\n/, "") +
            `[${filled}${empty}] ${Math.floor((progress / loadingBarLength) * 100)}%\n`
          progress++
        } else {
          clearInterval(interval)
          resolve()
        }
      }, 75)
    })
  }

  // Typing animation
  async function type() {
    if (messageIndex < messages.length) {
      if (charIndex < messages[messageIndex].length) {
        if (
          messages[messageIndex].includes("[Fetching date and time...]") &&
          charIndex === 0
        ) {
          dateTime = getDateTime()
          updateDateTimeMessage()
          updateTopStatusBar() // Update the top status bar
          typingText.innerHTML += messages[messageIndex]
          messageIndex++
          charIndex = 0
          setTimeout(type, 500)
        } else if (
          messages[messageIndex].includes("[Fetching IP...]") &&
          charIndex === 0
        ) {
          ipAddress = await fetchIP()
          updateWelcomeMessage()
          updateTopStatusBar() // Update the top status bar
          typingText.innerHTML += messages[messageIndex]
          messageIndex++
          charIndex = 0
          setTimeout(type, 500)
        } else {
          typingText.innerHTML += messages[messageIndex].charAt(charIndex)
          charIndex++
          setTimeout(type, 20)
        }
      } else {
        if (messages[messageIndex] === "Loading systems...") { typingText.innerHTML +="\n";
          
          await animateLoadingBar()
        }

        typingText.innerHTML += "\n"
        messageIndex++
        charIndex = 0
        setTimeout(type, 100)
      }
    } else {
      continuePrompt.classList.remove("hidden")
      window.addEventListener("keydown", handleKeyPress)
      window.addEventListener("click", handleKeyPress)
    }
  }

  // Custom Matrix rain animation
   const styles = `
  #matrix {
    position: fixed;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    z-index: -1;
    transition: opacity 0.8s ease-out;
  }
  
  #matrix.fade-out {
    opacity: 0;
  }
  
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
  `;
  
  // Create and append style element
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
  
  function startMatrixRain() {
    const canvas = document.getElementById("matrix");
    const ctx = canvas.getContext("2d");
    let isMatrixAnimationActive = true;
    
    // Function to handle resize
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    // Initial resize
    resizeCanvas();
    
    // Add resize listener
    window.addEventListener('resize', resizeCanvas);
    
    const characters = 
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()けげこごさざしじすずせぜそぞただ";
    const fontSize = 18;
    const columnWidth = 20;
    
    // Calculate columns based on screen width
    const columns = Math.floor(window.innerWidth / columnWidth);
    let drops = Array(columns).fill(0);
    
    function draw() {
      // Semi-transparent black for fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set text properties
      ctx.fillStyle = "#00FF00";
      ctx.font = `${fontSize}px 'VT323', monospace`;
      
      // Draw characters
      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        const x = i * columnWidth;
        const y = drops[i] * columnWidth;
        
        ctx.fillText(text, x, y);
        
        // Reset drop when it reaches bottom
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }
    
    // Start the interval-based animation
    const matrixInterval = setInterval(draw, 50);
    
    // Set up the animation cleanup after 5 seconds
    setTimeout(() => {
      canvas.classList.add("fade-out");
      setTimeout(() => {
        clearInterval(matrixInterval);
        canvas.remove();
        const portfolio = document.getElementById("portfolio");
        if (portfolio) {
          portfolio.style.display = "grid";
        }
        isMatrixAnimationActive = false;
        window.removeEventListener('resize', resizeCanvas);
      }, 800);
    }, 5000);
    
    // Return cleanup function
    return () => {
      clearInterval(matrixInterval);
      window.removeEventListener('resize', resizeCanvas);
      isMatrixAnimationActive = false;
    };
  }


  function handleKeyPress() {
    if (!animationTriggered) {
      // Only proceed if animation hasn't been triggered yet
      animationTriggered = true // Set flag to true

      // Remove event listeners to prevent further triggers
      window.removeEventListener("keydown", handleKeyPress)
      window.removeEventListener("click", handleKeyPress)

      const consoleElement = document.querySelector(".console")
      const matrixElement = document.getElementById("matrix")

      if (!consoleElement || !matrixElement) {
        console.error("Error: Could not find required elements in the DOM.")
        return
      }

      consoleElement.classList.add("hidden")
      matrixElement.classList.remove("hidden")

      startMatrixRain()
    }
  }  

  
   type() // Start the typing animation
})

// Dynamic Date & Time
function updateDateTime() {
  const date = new Date()
  const options = {
    weekday: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }
  document.getElementById("date-time").innerHTML = date.toLocaleDateString(
    undefined,
    options,
  )
}

setInterval(updateDateTime, 1000)




document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all nav items and content
        document.querySelectorAll('.nav-item').forEach(navItem => {
            navItem.classList.remove('active');
        });
        document.querySelectorAll('.content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Add active class to clicked nav item and corresponding content
        item.classList.add('active');
        const targetId = item.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
  });
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("#project-list a").forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            // Hide all content sections
            document.querySelectorAll(".content").forEach(content => content.classList.remove("active"));

            // Show the selected section
            const targetId = link.getAttribute("data-target");
            document.getElementById(targetId).classList.add("active");
        });
    });
});

function customAlert(message, timeout = 5000) {
  const alertBox = document.getElementById("customAlert");
  const alertMessage = document.getElementById("alertMessage");
  const closeButton = document.getElementById("closeAlert");

  alertMessage.textContent = message;
  alertBox.style.display = "block";

  closeButton.onclick = function() {
      alertBox.style.display = "none";
  };

  setTimeout(() => {
      alertBox.style.display = "none";
  }, timeout); // Auto-close after `timeout` milliseconds
}


function logAction(message, type = "normal") {
  const logList = document.getElementById("logList");
  const logItem = document.createElement("li");
  logItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  if (type === "error") {
    logItem.classList.add("log-error"); // Apply error styling
}
  logList.appendChild(logItem);

  // Auto-scroll log to the latest message
  logContainer.scrollTop = logContainer.scrollHeight;
}

async function deriveKey(password) {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
      "raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: encoder.encode("stego_salt"), iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
  );
}

async function encryptMessage(message, password) {
  const key = await deriveKey(password);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv }, key, encoder.encode(message)
  );
  const base64String = btoa(String.fromCharCode(...iv) + String.fromCharCode(...new Uint8Array(encrypted)));
  return base64String + "\0";
}

async function decryptMessage(encryptedMessage, password) {
  try {
      const key = await deriveKey(password);
      const data = atob(encryptedMessage);
      const iv = new Uint8Array([...data].slice(0, 12).map(c => c.charCodeAt(0)));
      const encryptedData = new Uint8Array([...data].slice(12).map(c => c.charCodeAt(0)));
      const decrypted = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv }, key, encryptedData
      );
      return new TextDecoder().decode(decrypted);
  } catch (error) {
      return "Incorrect password or corrupted data.";
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  const messageInput = document.getElementById("messageInput");
  const encryptionKey = document.getElementById("encryptionKey");
  const decodeKey = document.getElementById("decryptionKey");
  const encodeBtn = document.getElementById("encodeBtn");
  const decodeBtn = document.getElementById("decodeBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const decodedMessage = document.getElementById("decodedMessage");
  const charCounter = document.getElementById("charCounter");
  let uploadedImage = null;
  let encodedCanvas = document.createElement("canvas");
  let ctx = encodedCanvas.getContext("2d", { willReadFrequently: true });

  let maxChars = 0; // Ensure maxChars is properly initialized

  // Handle Image Upload
  imageInput.addEventListener("change", function () {
    // Display file name
    const fileName = this.files.length > 0 ? this.files[0].name : "No file chosen";
    document.getElementById("fileName").textContent = fileName;

    if (this.files.length > 0) {
        logAction("Uploading image...");
        const img = new Image();
        img.onload = function () {
            uploadedImage = img;
            encodedCanvas.width = img.width;
            encodedCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Count non-transparent pixels
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;
            let nonTransparentPixels = 0;
            
            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] === 255) {
                    nonTransparentPixels++;
                }
            }

            maxChars = Math.floor(nonTransparentPixels / 8);
            document.getElementById("messageLimit").textContent = `Max characters: ${maxChars}`;
            updateCharCounter();

            logAction("Image loaded successfully");
            messageInput.value = "";
            encryptionKey.value = "";
            decryptionKey.value = "";
            charCounter.textContent = "0 / " + maxChars;
        };
        img.src = URL.createObjectURL(this.files[0]);
    }
});
  // Live Character Counter
  messageInput.addEventListener("input", updateCharCounter);

  function updateCharCounter() {
      const remaining = Math.max(0, maxChars - messageInput.value.length);
      charCounter.textContent = `${messageInput.value.length} / ${maxChars}`;

      if (remaining === 0) {
          charCounter.style.color = "red"; // Warn when limit is reached
      } else {
          charCounter.style.color = "#00ff00"; // Normal green text
      }
  }

  // Encode Message
  encodeBtn.addEventListener("click", async () => {
    if (!uploadedImage || !messageInput.value || !encryptionKey.value) {
        customAlert("Please upload an image, enter a message, and provide a password.");
        return;
    }

    logAction("Encrypting message...");
    try {
        const encryptedText = await encryptMessage(messageInput.value, encryptionKey.value);
        const imageData = ctx.getImageData(0, 0, encodedCanvas.width, encodedCanvas.height);
        const data = imageData.data;

        // Count available pixels (non-transparent)
        let availablePixels = 0;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] === 255) { // Check alpha channel
                availablePixels++;
            }
        }

        // Check if we have enough non-transparent pixels
        if (encryptedText.length * 8 > availablePixels) {
            throw new Error("Not enough non-transparent pixels for message");
        }

        // Encode message only in non-transparent pixels
        let messageIndex = 0;
        for (let i = 0; i < data.length && messageIndex < encryptedText.length * 8; i += 4) {
            // Only use pixels that are fully opaque
            if (data[i + 3] === 255) {
                const charCode = encryptedText.charCodeAt(Math.floor(messageIndex / 8));
                const bit = (charCode >> (7 - (messageIndex % 8))) & 1;
                data[i] = (data[i] & 0xFE) | bit;
                messageIndex++;
            }
        }

        ctx.putImageData(imageData, 0, 0);
        logAction("Message encoded successfully");
        logAction("Encoded image ready to download")
        customAlert("Encoded image ready to download")
        messageInput.value = "";
        encryptionKey.value = "";
        charCounter.textContent = "0 / " + maxChars;
    } catch (error) {
        logAction("Encoding failed: " + error.message,"error");
        customAlert("Failed to encode message: " + error.message);
    }
});




  async function decryptMessage(encryptedMessage, password) {
    try {
       
        console.log("Extracted Base64 Text:", encryptedMessage);

        // Ensure Base64 decoding is correct
        let encryptedData;
        try {
            encryptedData = new Uint8Array([...atob(encryptedMessage)].map(c => c.charCodeAt(0)));
        } catch (error) {
            console.error("Base64 Decoding Error:", error);
            return "Base64 decoding failed!";
            
        }

        // Extract IV and ciphertext
        const iv = encryptedData.slice(0, 12); // AES-GCM requires a 12-byte IV
        const ciphertext = encryptedData.slice(12);

        console.log("Extracted IV:", iv);
        console.log("Extracted Encrypted Data:", ciphertext);

        // Validate IV and ciphertext
        if (iv.length !== 12 || ciphertext.length === 0) {
            console.error("IV or Ciphertext is incorrect!", iv, ciphertext);
            return "Decryption failed: IV or ciphertext incorrect!";
        }

        // Generate key from password
        const key = await deriveKey(password);

        // Attempt decryption
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            ciphertext
        );

        const decryptedText = new TextDecoder().decode(decryptedBuffer);
        console.log("Decrypted Text:", decryptedText);

        return decryptedText;
    } catch (error) {
        console.error("Decryption error:", error);
        return "Decryption failed!";
    }
}


  // Decode Message
  decodeBtn.addEventListener("click", async () => {
    if (!uploadedImage || !decodeKey.value) {
        customAlert("Please upload an encoded image and enter the password to decode.");
        return;
    }

    logAction("Extracting message from image...");
    try {
        const imageData = ctx.getImageData(0, 0, encodedCanvas.width, encodedCanvas.height);
        const data = imageData.data;
        let bits = [];
        let extractedText = "";
        
        // Collect bits only from non-transparent pixels
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] === 255) { // Check alpha channel
                bits.push(data[i] & 1);
            }
        }

        if (bits.length === 0) {
            throw new Error("No non-transparent pixels found in image");
        }

        // Convert bits to characters
        for (let i = 0; i < bits.length; i += 8) {
            let charCode = 0;
            for (let j = 0; j < 8; j++) {
                if (i + j < bits.length) {
                    charCode |= bits[i + j] << (7 - j);
                }
            }
            
            // Stop at null terminator
            if (charCode === 0) {
                break;
            }
            extractedText += String.fromCharCode(charCode);
        }

        // Validate extracted text is valid base64
        if (!extractedText || !/^[A-Za-z0-9+/]*={0,2}$/.test(extractedText)) {
            throw new Error("No valid encoded message found");
        }

        logAction("Attempting to decrypt message...");
        const decryptedText = await decryptMessage(extractedText, decodeKey.value);
        
        if (!decryptedText || decryptedText.includes("failed")) {
            throw new Error("Invalid password or corrupted data");
        }

        logAction("Message successfully decrypted");
        decodedMessage.textContent = decryptedText;
        decodeKey.value = "";

    } catch (error) {
        console.error("Decoding/Decryption error:", error);
        logAction("Error: " + error.message,"error");
        decodedMessage.textContent = "Error: " + error.message;
    }
});


  // Download Encoded Image (Fixed)
  downloadBtn.addEventListener("click", () => {
      if (!uploadedImage) {
          customAlert("No encoded image available to download.");
          return;
      }
      
      logAction("Downloading encoded image...");
      const link = document.createElement("a");
      link.download = "encoded_image.png";
      link.href = encodedCanvas.toDataURL("image/png");
      link.click();
      logAction("Encoded Image downloaded")
  });
});

