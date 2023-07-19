
       const rockBtn = document.getElementById('rock-btn');  
       const scissorsBtn = document.getElementById('scissors-btn');  
       const paperBtn = document.getElementById('paper-btn');  
       const startBtn = document.getElementById('start-btn');  
       const userChoice = document.getElementById('user-choice');  
       const computerChoice = document.getElementById('computer-choice');
       let userSelection = null;  
       let computerSelection = null;
       rockBtn.addEventListener('click', () => {  
           userSelection = 'rock';  
           userChoice.textContent = '石头';  
           startBtn.disabled = false;  
       });
       scissorsBtn.addEventListener('click', () => {  
           userSelection = 'scissors';  
           userChoice.textContent = '剪刀';  
           startBtn.disabled = false;  
       });
       paperBtn.addEventListener('click', () => {  
           userSelection = 'paper';  
           userChoice.textContent = '布';  
           startBtn.disabled = false;  
       });
       startBtn.addEventListener('click', () => {  
           const computerSelection = Math.random() < 0.5 ? 'rock' : (Math.random() < 0.33 ? 'scissors' : 'paper');  
			
			if(computerSelection == 'rock')
				computerSelection2 = '石头';

			if(computerSelection == 'paper')
				computerSelection2 = '布';

			if(computerSelection == 'scissors')
				computerSelection2 = '剪刀';				

           computerChoice.textContent = computerSelection;
           if (userSelection === computerSelection) {  
               userChoice.textContent = '平局';  
           } else if (userSelection === 'rock' && computerSelection === 'scissors') {  
               userChoice.textContent = '用户胜利';  
           } else if (userSelection === 'scissors' && computerSelection === 'paper') {  
               userChoice.textContent = '用户胜利';  
           } else if (userSelection === 'paper' && computerSelection === 'rock') {  
               userChoice.textContent = '用户胜利';  
           }
           startBtn.disabled = true;  

		    computerChoice.textContent = computerSelection2;
       });  
