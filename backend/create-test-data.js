import axios from 'axios';

const API_BASE = 'http://localhost:3001';

// Données de test variées
const testConversations = [
  {
    title: "Planification de voyage en Europe",
    child_mode: false,
    private_mode: false,
    tags: ["voyage", "europe", "planification"],
    messages: [
      { content: "Bonjour ! Je prévois un voyage de 2 semaines en Europe cet été. Pouvez-vous m'aider à planifier ?", is_user: true },
      { content: "Bien sûr ! C'est passionnant de planifier un voyage en Europe. Quels pays souhaitez-vous visiter ?", is_user: false },
      { content: "Je pense à la France, l'Italie et l'Espagne. J'ai un budget de 3000€.", is_user: true },
      { content: "Excellente idée ! Ces pays offrent une belle diversité culturelle. Pour 3000€ sur 2 semaines, vous pouvez bien profiter.", is_user: false }
    ]
  },
  {
    title: "Recette de cuisine française",
    child_mode: false,
    private_mode: false,
    tags: ["cuisine", "france", "recette"],
    messages: [
      { content: "J'aimerais apprendre à cuisiner des plats français traditionnels. Par où commencer ?", is_user: true },
      { content: "La cuisine française est magnifique ! Commençons par les bases : la soupe à l'oignon et la quiche lorraine.", is_user: false },
      { content: "Parfait ! Pouvez-vous me donner la recette de la soupe à l'oignon ?", is_user: true },
      { content: "Bien sûr ! Voici une recette authentique : oignons, beurre, bouillon de bœuf, pain et fromage râpé.", is_user: false }
    ]
  },
  {
    title: "Apprentissage du piano",
    child_mode: false,
    private_mode: false,
    tags: ["musique", "piano", "apprentissage"],
    messages: [
      { content: "Je veux apprendre le piano à 30 ans. Est-ce trop tard ?", is_user: true },
      { content: "Jamais trop tard ! L'âge adulte apporte même des avantages : discipline, patience et motivation.", is_user: false },
      { content: "Combien de temps faut-il pour jouer une chanson simple ?", is_user: true },
      { content: "Avec 30 minutes par jour, vous pourrez jouer une mélodie simple en 2-3 mois.", is_user: false }
    ]
  },
  {
    title: "Histoire des dinosaures",
    child_mode: true,
    private_mode: false,
    tags: ["dinosaures", "histoire", "enfant"],
    messages: [
      { content: "Dis maman, c'est quoi un dinosaure ?", is_user: true },
      { content: "Les dinosaures étaient de gros animaux qui vivaient il y a très longtemps, avant même que les humains existent !", is_user: false },
      { content: "Ils étaient gentils ?", is_user: true },
      { content: "Certains étaient gentils et mangeaient des plantes, d'autres étaient plus féroces et chassaient.", is_user: false }
    ]
  },
  {
    title: "Programmation web moderne",
    child_mode: false,
    private_mode: false,
    tags: ["programmation", "web", "javascript"],
    messages: [
      { content: "Je veux apprendre le développement web moderne. Quelles technologies recommandes-tu ?", is_user: true },
      { content: "Pour le web moderne, je recommande : HTML5, CSS3, JavaScript ES6+, React/Vue.js, et Node.js.", is_user: false },
      { content: "Et pour la base de données ?", is_user: true },
      { content: "PostgreSQL pour les bases relationnelles, MongoDB pour NoSQL, ou SQLite pour les petits projets.", is_user: false }
    ]
  },
  {
    title: "Méditation et bien-être",
    child_mode: false,
    private_mode: true,
    tags: ["méditation", "bien-être", "personnel"],
    messages: [
      { content: "Je me sens stressé au travail. Comment commencer la méditation ?", is_user: true },
      { content: "La méditation peut vraiment aider ! Commencez par 5 minutes par jour, assis confortablement.", is_user: false },
      { content: "Quelle technique recommandes-tu pour débuter ?", is_user: true },
      { content: "La respiration consciente est parfaite pour débuter. Concentrez-vous sur votre souffle.", is_user: false }
    ]
  },
  {
    title: "Photographie de paysage",
    child_mode: false,
    private_mode: false,
    tags: ["photographie", "paysage", "art"],
    messages: [
      { content: "J'ai un appareil photo reflex. Comment prendre de belles photos de paysages ?", is_user: true },
      { content: "Pour les paysages, utilisez un petit diaphragme (f/8 à f/16) pour une grande profondeur de champ.", is_user: false },
      { content: "Et pour la composition ?", is_user: true },
      { content: "Appliquez la règle des tiers, cherchez des lignes directrices et incluez un premier plan intéressant.", is_user: false }
    ]
  },
  {
    title: "Gestion du temps au travail",
    child_mode: false,
    private_mode: false,
    tags: ["productivité", "travail", "organisation"],
    messages: [
      { content: "Je me sens débordé au travail. Comment mieux gérer mon temps ?", is_user: true },
      { content: "La technique Pomodoro peut vous aider : 25 minutes de travail concentré, puis 5 minutes de pause.", is_user: false },
      { content: "Et pour prioriser mes tâches ?", is_user: true },
      { content: "Utilisez la matrice d'Eisenhower : urgent/important, urgent/pas important, pas urgent/important, pas urgent/pas important.", is_user: false }
    ]
  }
];

async function createTestData() {
  try {
    console.log('🔐 Connexion en tant qu\'admin...');
    
    // 1. Connexion admin
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Connexion réussie !');
    
    // 2. Créer les conversations de test
    console.log('\n📝 Création des conversations de test...');
    
    for (let i = 0; i < testConversations.length; i++) {
      const conv = testConversations[i];
      console.log(`\n--- Création conversation ${i + 1}/${testConversations.length} ---`);
      console.log(`Titre: ${conv.title}`);
      
      try {
        const response = await axios.post(`${API_BASE}/api/conversations`, {
          title: conv.title,
          child_mode: conv.child_mode,
          private_mode: conv.private_mode,
          tags: conv.tags,
          initial_messages: conv.messages
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Conversation créée avec l'ID: ${response.data.data.id}`);
        console.log(`📊 Messages ajoutés: ${conv.messages.length}`);
        
      } catch (error) {
        console.error(`❌ Erreur création conversation "${conv.title}":`, error.response?.data || error.message);
      }
      
      // Petite pause entre les créations
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 3. Vérifier les statistiques finales
    console.log('\n📊 Vérification des statistiques finales...');
    
    const statsResponse = await axios.get(`${API_BASE}/api/conversations/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📈 Statistiques finales :');
    console.log(JSON.stringify(statsResponse.data.data, null, 2));
    
    // 4. Lister toutes les conversations
    const conversationsResponse = await axios.get(`${API_BASE}/api/conversations?limit=1000`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const conversations = conversationsResponse.data.data.conversations;
    console.log(`\n💬 Total conversations: ${conversations.length}`);
    
    conversations.forEach((conv, index) => {
      console.log(`\n--- Conversation ${index + 1} ---`);
      console.log(`ID: ${conv.id}`);
      console.log(`Titre: ${conv.title}`);
      console.log(`Messages: ${conv.message_count}`);
      console.log(`Tags: ${conv.tags?.join(', ') || 'Aucun'}`);
      console.log(`Mode enfant: ${conv.child_mode ? 'Oui' : 'Non'}`);
      console.log(`Mode privé: ${conv.private_mode ? 'Oui' : 'Non'}`);
    });
    
    console.log('\n🎉 Données de test créées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Exécuter le script
createTestData();
