# Recicla Mais - Mobile App (Flutter)

Aplicativo mobile desenvolvido em Flutter para a plataforma Recicla Mais.

## Funcionalidades

- ✅ Login e Registro de usuários
- ✅ Visualização de denúncias no mapa
- ✅ Criação de denúncias com fotos e geolocalização
- ✅ Listagem de denúncias próprias
- ✅ Integração com API REST do backend

## Pré-requisitos

- Flutter SDK 3.0.0 ou superior
- Dart SDK 3.0.0 ou superior
- Android Studio / Xcode (para desenvolvimento)
- Conta Google (para Google Maps API)

## Instalação

1. Clone o repositório e navegue até a pasta do mobile:
```bash
cd frontend/mobile
```

2. Instale as dependências:
```bash
flutter pub get
```

3. Configure a API do Google Maps:
   - Obtenha uma chave da API do Google Maps em [Google Cloud Console](https://console.cloud.google.com/)
   - Para Android: Adicione a chave em `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="SUA_CHAVE_AQUI"/>
   ```
   - Para iOS: Adicione a chave em `ios/Runner/AppDelegate.swift` ou `Info.plist`

4. Execute o aplicativo:
```bash
flutter run
```

## Estrutura do Projeto

```
lib/
├── config/          # Configurações (API, router, theme)
├── models/          # Modelos de dados (User, Complaint)
├── providers/       # Gerenciamento de estado (AuthProvider, ComplaintProvider)
├── screens/         # Telas do aplicativo
├── services/        # Serviços (API Service)
└── main.dart        # Ponto de entrada
```

## Tecnologias Utilizadas

- **Flutter** - Framework multiplataforma
- **Provider** - Gerenciamento de estado
- **GoRouter** - Navegação
- **Dio** - Cliente HTTP
- **Google Maps Flutter** - Mapas interativos
- **Geolocator** - Geolocalização
- **Image Picker** - Seleção de imagens
- **Shared Preferences** - Armazenamento local

## Configuração da API

A URL base da API está configurada em `lib/config/api_config.dart`:
```dart
static const String baseUrl = 'https://recicla-mais.onrender.com/api/v1';
```

Para usar uma URL diferente, modifique este arquivo ou use variáveis de ambiente.

## Build para Produção

### Android
```bash
flutter build apk --release
```

### iOS
```bash
flutter build ios --release
```

## Notas

- O aplicativo requer permissões de localização e câmera/galeria
- Certifique-se de que o backend está rodando e acessível
- Para desenvolvimento, você pode usar um emulador ou dispositivo físico

