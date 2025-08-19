import axios from 'axios';

const API_BASE = 'http://localhost:3001';

async function viewAdminData() {
  try {
    console.log('🔐 Connexion en tant qu\'admin...');
    
    // 1. Connexion admin
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Connexion réussie !');
    
    // 2. Récupérer les informations utilisateur
    const userResponse = await axios.get(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('\n👤 Informations utilisateur admin :');
    console.log(JSON.stringify(userResponse.data.data, null, 2));
    
    // 3. Récupérer toutes les conversations
    const conversationsResponse = await axios.get(`${API_BASE}/api/conversations?limit=1000`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const conversations = conversationsResponse.data.data.conversations;
    console.log(`\n💬 Conversations trouvées : ${conversations.length}`);
    
    conversations.forEach((conv, index) => {
      console.log(`\n--- Conversation ${index + 1} ---`);
      console.log(`ID: ${conv.id}`);
      console.log(`Titre: ${conv.title}`);
      console.log(`Messages: ${conv.message_count}`);
      console.log(`Créée: ${conv.created_at}`);
      console.log(`Modifiée: ${conv.updated_at}`);
      console.log(`Mode enfant: ${conv.child_mode ? 'Oui' : 'Non'}`);
      console.log(`Mode privé: ${conv.private_mode ? 'Oui' : 'Non'}`);
      if (conv.tags && conv.tags.length > 0) {
        console.log(`Tags: ${conv.tags.join(', ')}`);
      }
    });
    
    // 4. Statistiques globales
    const statsResponse = await axios.get(`${API_BASE}/api/conversations/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('\n📊 Statistiques globales :');
    console.log(JSON.stringify(statsResponse.data.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Exécuter le script
viewAdminData();
