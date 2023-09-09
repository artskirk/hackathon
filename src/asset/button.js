require('dotenv').config({ path: '../../.env' });
const { OAI_MODEL_GPT_DEFAULT, OAI_GPT4 } = process.env

const button = {
    confirmCreateFollowupEmailAction: {
        message: "Would you like me to create a follow-up emails and request the additional information ?",
        tree: [
            [
                {
                    text: 'Yes',
                    callback_data: 'ticket_create_followup_email'
                },
                {
                    text: 'No',
                    callback_data: 'ticket_search_cancel'
                }  
            ]
        ]
    },
    classifyNewTicketAction: {
        message: "Would you like me to continue with classifying those tickets 🙂 ?",
        tree: [
            [
                {
                    text: 'Yes',
                    callback_data: 'ticket_search_classify'
                },
                {
                    text: 'No',
                    callback_data: 'ticket_search_cancel'
                }  
            ]
        ]
    },
    createTicket: {
        message: "👋 Hello there! I am your virtual assistant. Please select the action you require assistance with:",
        tree: [
            [
                {
                    text: 'New Support Ticket',
                    callback_data: 'ticket_create'
                },
                {
                    text: 'Help solve the issue',
                    callback_data: 'ticket_technical_assist'
                }  
            ]
        ]
    },
    createTicketAfter: {
        message: "ℹ️ Is there anything else I can assist you with ?",
        tree: [
            [
                {
                    text: 'Create one more Ticket',
                    callback_data: 'ticket_create'
                },
                {
                    text: 'Help solve the issue',
                    callback_data: 'ticket_technical_assist'
                }
            ],
            [
                {
                    text: 'Exit',
                    callback_data: 'ticket_create_exit'
                }
            ]
        ]
    },
    issueTroubleshootAfter : {
        message: "I hope my expertise was helpful to you. If there's anything else you need assistance with or if you have any feedback, please let me know. 🙂",
        tree: [
            [
                {
                    text: 'Create new Ticket',
                    callback_data: 'ticket_create'
                },
                {
                    text: 'Solve one more issue',
                    callback_data: 'ticket_technical_assist'
                }
            ],
            [
                {
                    text: 'Exit',
                    callback_data: 'ticket_create_exit'
                }
            ]
        ]
    },
    voice: {
        message: 'ℹ️ Please select the announcer from the given list who will voice your scenario:',
        tree: [
            [
                {
                    text: 'Emily, US',
                    callback_data: 'voice_emily_en'
                },                
                {
                    text: 'Madison, US',
                    callback_data: 'voice_madison_en'
                }
            ],
            [
                {
                    text: 'Ava, US',
                    callback_data: 'voice_ava_en'
                },
                {
                    text: 'Elizabeth, US',
                    callback_data: 'voice_elizabeth_en'
                }               
            ],
            [
                {
                    text: 'Jane, US',
                    callback_data: 'voice_jane_en'
                },
                {
                    text: 'Aiden, US',
                    callback_data: 'voice_aiden_en'
                }
            ],
            [
                {
                    text: 'Benjamin, US',
                    callback_data: 'voice_benjamin_en'
                },
                {
                    text: 'Andrew, US',
                    callback_data: 'voice_andrew_en'
                }
            ],                        
            [
                {
                    text: 'Jacob, US',
                    callback_data: 'voice_jacob_en'
                },                
                {
                    text: 'David, US',
                    callback_data: 'voice_david_en'
                }
            ],
            [
                {
                    text: 'Polina, RU',
                    callback_data: 'voice_polina_ru'
                },
                {
                    text: 'Valeria, RU',
                    callback_data: 'voice_valeria_ru'
                }
            ],
            [  
                {
                    text: 'Valentina, RU',
                    callback_data: 'voice_valentina_ru'
                },             
                {
                    text: 'Ivan, RU',
                    callback_data: 'voice_ivan_ru'
                }
            ],
            [   
                {
                    text: 'Pavel, RU',
                    callback_data: 'voice_pavel_ru'
                },             
                {
                    text: 'Viktor, RU',
                    callback_data: 'voice_viktor_ru'
                }
            ]
        ]
    },
    voiceCreateConfirmation: {
        message: '⚠️ This process may take a few minutes. Would you like to proceed?',
        tree: [
            [
                {
                    text: 'Confirm',
                    callback_data: 'voice_create_confirm'
                },
                {
                    text: 'Cancel',
                    callback_data: 'voice_create_cancel'
                }
            ]
        ]
    },
    voiceAwaitSpeakingRateInput: {
        message: 'ℹ️ Value is successfully received',
        tree: [
            [
                {
                    text: 'Set Pitch',
                    callback_data: 'voice_advanced_settings_pitch'
                },
                {
                    text: 'Skip',
                    callback_data: 'voice_advanced_settings_pitch_skip'
                }
            ]
        ]
    },
    voiceAwaitPitchInput: {
        message: 'ℹ️ Value is successfully received',
        tree: [
            [
                {
                    text: 'Update Pronunciation Speed',
                    callback_data: 'voice_advanced_settings_speaking_rate'
                }
            ],
            [                
                {
                    text: 'Skip',
                    callback_data: 'voice_advanced_settings_speaking_rate_skip'
                }
            ]
        ]
    },
    voiceAdvancedSettings: {
        message: '⚠️ Would you like to proceed with the advanced voice settings or keep the default settings?',
        tree: [
            [
                {
                    text: 'Proceed',
                    callback_data: 'voice_advanced_settings_proceed'
                },
                {
                    text: 'Keep the default',
                    callback_data: 'voice_advanced_settings_skip'
                }
            ]
        ]
    },
    voiceAdvancedSettingsProceed: {
        message: `⚠️ Now, choose the options for the advanced voice settings. By default, GrademeAI will generate the SSML markup for your text scenario. However, you can disable it if you prefer. For more information about SSML, please visit this link: https://en.wikipedia.org/wiki/Speech_Synthesis_Markup_Language`,
        tree: [
            [
                {
                    text: 'Set Pronunciation Speed',
                    callback_data: 'voice_advanced_settings_speaking_rate'
                }
            ],
            [
                {
                    text: 'Enable SSML',
                    callback_data: 'voice_advanced_settings_enable_ssml'
                },
                {
                    text: 'Disable SSML',
                    callback_data: 'voice_advanced_settings_disable_ssml'
                }
            ],
            [   
                {
                    text: 'Set pitch',
                    callback_data: 'voice_advanced_settings_pitch'
                },             
                {
                    text: 'Cancel',
                    callback_data: 'voice_advanced_settings_cancel'
                }
            ]
        ]
    },
    voiceCreateAfter: {
        message: 'ℹ️ Please choose an action to proceed',
        tree: [
            [
                {
                    text: 'New Record',
                    callback_data: 'voice_create_new'
                },
                {
                    text: 'Edit Scenario',
                    callback_data: 'voice_advanced_settings_edit_text_input'
                },
            ],
            [
                
                {
                    text: 'Change Pitch',
                    callback_data: 'voice_advanced_settings_pitch'
                }
            ],
            [
                {
                    text: 'Change Pronunciation Speed',
                    callback_data: 'voice_advanced_settings_speaking_rate'
                }
            ],
            [
                {
                    text: 'Enable SSML',
                    callback_data: 'voice_advanced_settings_enable_ssml'
                },
                {
                    text: 'Disable SSML',
                    callback_data: 'voice_advanced_settings_disable_ssml'
                }
            ],
            [
                {
                    text: 'Use Another Speaker',
                    callback_data: 'voice_advanced_settings_switch_speaker'
                }
            ],
            [
                
                {
                    text: 'Exit',
                    callback_data: 'voice_create_cancel'
                }
            ]
        ]
    },
    ai: {
        message: 'Choose the AI model you would like to use:',
        tree: [
            [
                {
                    text: '🧠 GPT-3.5 Turbo',
                    callback_data: OAI_MODEL_GPT_DEFAULT
                },
                {
                    text: '🧠 GPT-4',
                    callback_data: OAI_GPT4
                }
            ]
        ]
    },
    language: {
        message: 'Select the language:',
        tree: [
            [
                {
                    text: '🇺🇸 En',
                    callback_data: 'en'
                },
                {
                    text: '🇷🇺 Ru',
                    callback_data: 'ru'
                }
            ]
        ]
    },
    translate: {
        message: 'Choose the language would you like to translate your messages: ',
        tree: [
            [
                {
                    text: '🇺🇸 En',
                    callback_data: 'tr_en'
                },
                {
                    text: '🇷🇺 Ru',
                    callback_data: 'tr_ru'
                }
            ],
            [
                {
                    text: '🇩🇪 De',
                    callback_data: 'tr_de'
                },
                {
                    text: '🇫🇷 Fr',
                    callback_data: 'tr_fr'
                }
            ],
            [
                {
                    text: '🇵🇱 Pl',
                    callback_data: 'tr_pl'
                },
                {
                    text: '🇨🇳 Cn',
                    callback_data: 'tr_cn'
                }
            ],
            [
                {
                    text: '🛑 Stop',
                    callback_data: 'tr_stop'
                }
            ]
        ]
    },
    reset: {
        message: '⚠️ Are you sure you want to reset your settings to the default ?',
        tree: [
            [
                {
                    text: 'Yes',
                    label: 'Yes',
                    label_ru: 'Да',
                    callback_data: 'reset_yes'
                },
                {
                    text: 'No',
                    label: 'No',
                    label_ru: 'Нет',
                    callback_data: 'reset_no'
                }
            ]
        ],
    },
    premiumSubscription: {
        message: 'Would you like to upgrade to a Premium Subscription now for only 2.99 EUR ?',
        tree: [
            [
                {
                    text: 'Yes',
                    label: 'Yes',
                    label_ru: 'Да',
                    callback_data: 'premium_subscription_yes'
                },
                {
                    text: 'No',
                    label: 'No',
                    label_ru: 'Нет',
                    callback_data: 'premium_subscription_no'
                }
            ]
        ],
    },
    act: {
        message: 'Please select the sample of the person you would like me to mimic, and I will do my best to match their style and tone.',
        tree: [
            [
                {
                    text: '🤖 Virtual assistant',
                    label: 'Virtual assistant',
                    label_ru: 'Виртуальный ассистент',
                    callback_data: 'virtual_assistant'
                },
                {
                    text: '🧠 Scientist',
                    label: 'Scientist',
                    label_ru: 'Ученый',
                    callback_data: 'scientist'
                }
            ],
            [
                {
                    text: '🤪 Crazy',
                    label: 'Crazy',
                    label_ru: 'Шизофреник',
                    callback_data: 'crazy'
                },
                {
                    text: '👨‍🦱 Personal coach',
                    label: 'Personal coach',
                    label_ru: 'Тренер личностного роста',
                    callback_data: 'personal_coach'
                }
            ],
            [
                {
                    text: '👌 Matchmaker',
                    label: 'Matchmaker',
                    label_ru: 'Сваха',
                    callback_data: 'matchmaker'
                },
                {
                    text: '😎 Personal companion',
                    label: 'Personal companion',
                    label_ru: 'Приятель',
                    callback_data: 'personal_companion'
                }
            ],
            [
                {
                    text: '👗 Fashion consultant',
                    label: 'Fashion consultant',
                    label_ru: 'Стилист',
                    callback_data: 'fashion_consultant'
                },
                {
                    text: '💪 Fitness trainer',
                    label: 'Fitness trainer',
                    label_ru: 'Фитнес-инструктор',
                    callback_data: 'fitness_trainer'
                }
            ],
            [
                {
                    text: '💸 Financial advisor',
                    label: 'Financial advisor',
                    label_ru: 'Финансовый консультант',
                    callback_data: 'financial_advisor'
                },
                {
                    text: '🇺🇸 Language tutor',
                    label: 'Language tutor',
                    label_ru: 'Личный репетитор',
                    callback_data: 'language_tutor'
                }
            ],
            [
                {
                    text: '🧘🏼‍♀️ Life coach',
                    label: 'Life coach',
                    label_ru: 'Жизненный наставник',
                    callback_data: 'life_coach'
                },
                {
                    text: '💵 Business coach',
                    label: 'Business coach',
                    label_ru: 'Бизнес тренер',
                    callback_data: 'business_coach'
                }
            ],
            [
                {
                    text: '🦹‍♂️ Street tough',
                    label: 'Street tough',
                    label_ru: 'Гопник',
                    callback_data: 'street_tough'
                },
                {
                    text: '🎤 Interviewer',
                    label: 'Interviewer',
                    label_ru: 'Интервьюер',
                    callback_data: 'interviewer'
                }
            ],
            [
                {
                    text: '🥸 Preacher',
                    label: 'Preacher',
                    label_ru: 'Церковный проповедник',
                    callback_data: 'preacher'
                },
                {
                    text: '😉 Buddy',
                    label: 'Buddy',
                    label_ru: 'словно ты мой друг',
                    callback_data: 'buddy'
                }
            ],
            [
                {
                    text: '💙 Boyfriend',
                    label: 'Boyfriend',
                    label_ru: 'словно ты мой парень',
                    callback_data: 'boyfriend'
                },
                {
                    text: '❤️ Girlfriend',
                    label: 'Girlfriend',
                    label_ru: 'словно ты моя девушка',
                    callback_data: 'girlfriend'
                }
            ],
            [
                {
                    text: '🧑‍⚕️ Personal psychologist',
                    label: 'Personal psychologist',
                    label_ru: 'словно мой персональный психолог',
                    callback_data: 'psychologist'
                }
            ],
            [
                {
                    text: '🚀 Artificial Intelligence',
                    label: 'Artificial Intelligence',
                    label_ru: 'Искуственный интеллект',
                    callback_data: 'ai'
                }
            ]
        ]
    }
};

module.exports = { button };