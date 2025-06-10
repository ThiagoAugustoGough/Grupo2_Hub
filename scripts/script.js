const stepsContainer = document.getElementById('stepsContainer');
const progressFill = document.getElementById('progressFill');
const modal = document.getElementById('challengeModal');
const challengeTitle = document.getElementById('challengeTitle');
const challengeText = document.getElementById('challengeText');
const userResponse = document.getElementById('userResponse');

const challenges = {
    1: 'Escreva 3 frutas que você mais gosta.',
    2: 'Dê um exemplo de alimento in natura.',
    3: 'Cite 2 alimentos processados que consome.',
    4: 'Qual alimento ultraprocessado você pode evitar hoje?',
    5: 'Com quem você costuma fazer refeições?',
    6: 'Onde você costuma comprar seus alimentos?',
    7: 'Qual sua receita favorita para compartilhar?',
    8: 'Quantas refeições você planejou esta semana?',
    9: 'Dê um exemplo de restaurante com comida caseira.',
    10: 'Já viu alguma propaganda que parecia enganar? Qual?'
};

let completedSteps = JSON.parse(localStorage.getItem('completedSteps')) || [];
let stepResponses = JSON.parse(localStorage.getItem('stepResponses')) || {};
let currentStep = null;

    // Adiciona o evento de clique aos cards fixos para abrir o modal
document.querySelectorAll('.step-card').forEach(card => {
    const stepNumber = parseInt(card.dataset.step);

    // Oculta a descrição inicialmente
    if (!completedSteps.includes(stepNumber)) {
        card.querySelector('.step-description').style.display = 'none';
    } else {
        card.classList.add('completed');
    }

    // Clique para abrir desafio
    card.addEventListener('click', () => openChallengeModal(stepNumber));
});

function updateProgress() {
    const percent = (completedSteps.length / 10) * 100;
    progressFill.style.width = `${percent}%`;
}

function saveProgress() {
    localStorage.setItem('completedSteps', JSON.stringify(completedSteps));
    localStorage.setItem('stepResponses', JSON.stringify(stepResponses));
}

function openChallengeModal(step) {
    currentStep = step;
    challengeTitle.textContent = `Desafio do Passo ${step}`;
    challengeText.textContent = challenges[step];
    userResponse.value = stepResponses[step] || '';
    modal.style.display = 'flex';
}

function completeChallenge() {
    const response = userResponse.value.trim();

    if (!response) {
        alert('Por favor, responda o desafio antes de concluir.');
        return;
    }

    stepResponses[currentStep] = response;
    if (!completedSteps.includes(currentStep)) {
        completedSteps.push(currentStep);
        const card = document.querySelector(`.step-card[data-step='${currentStep}']`);
        card.classList.add('completed');
        card.querySelector('.step-description').style.display = 'block';
    }

    updateProgress();
    saveProgress();
    alert('🎉 Avokiddo está orgulhoso de você!');
    modal.style.display = 'none';
}

function cancelChallenge() {
    modal.style.display = 'none';
}

function resetProgress() {
    if (confirm('Tem certeza que deseja reiniciar todos os desafios?')) {
        completedSteps = [];
        stepResponses = {};
        localStorage.removeItem('completedSteps');
        localStorage.removeItem('stepResponses');
        document.querySelectorAll('.step-card').forEach(card => {
            card.classList.remove('completed');
            card.querySelector('.step-description').style.display = 'none'; // Oculta novamente
        });
        
        updateProgress();
        modal.style.display = 'none';
    }
}

updateProgress();