import type { Dict } from 'i18n-js'

export const translations: Dict = {
  en: {
    common: {
      messages: {
        copiedToClipboard: 'Copied to clipboard',
      },

      actions: {
        back: 'Back',
        open: 'Open',
        share: 'Share',
        copy: 'Copy',
      },

      states: {
        loading: 'Loading...',
        noContent: 'No content available.',
      },

      errors: {
        generic: 'An error occurred.',
        permissionRequired: 'Permission is required to continue.',
      },

      permissions: {
        camera: 'Camera permission is required.',
        location: 'Location permission is required.',
      },

      fallback: {
        noName: 'No name',
      },
    },

    welcome: {
      description:
        'Welcome to the budgeting app! Make your product budgets easily and quickly.',
      actions: {
        getStarted: 'Get Started',
      },
    },

    signIn: {
      title: 'Sign in to your account',
      description: 'Please sign in to continue',

      username: {
        label: 'Username',
        placeholder: 'Enter your username',
        validation: {
          required: 'Username is required.',
        },
      },

      password: {
        label: 'Password',
        placeholder: 'Enter your password',
        validation: {
          required: 'Password is required.',
        },
      },

      workspaceId: {
        label: 'Workspace ID',
        placeholder: 'Enter your workspace ID',
        validation: {
          required: 'Workspace ID is required.',
        },
      },

      actions: {
        submit: 'Continue',
      },
    },

    session: {
      errors: {
        expired: 'Your session has expired. Please sign in again.',
      },
    },

    home: {
      title: 'Home',

      recentProducts: {
        title: 'Recent products',

        states: {
          empty: 'No recent products found.',
        },

        errors: {
          loading: 'Unable to load recent products.',
        },
      },
    },

    search: {
      title: 'Search',

      input: {
        placeholder: 'Products, variants and more',
      },

      actions: {
        qrCode: 'QR Code',
      },

      states: {
        noResults: 'No results found.',
      },

      errors: {
        loading: 'Error loading search results. Please try again later.',
      },
    },

    scanner: {
      title: 'Scanner',
    },

    product: {
      actions: {
        addToCart: 'Add to cart',
        updateCart: 'Update cart',
      },

      states: {
        notFound: 'Product not found.',
      },

      errors: {
        loading: 'Error loading product. Please try again later.',
      },
    },

    cart: {
      title: 'Cart',

      actions: {
        viewAllCarts: 'View all',
        newCart: 'New cart',
        shareCart: 'Share cart',
        checkout: 'Checkout',
      },

      states: {
        noCartFound: 'No cart selected.',
        noItems: 'No items in the cart.',
      },
    },

    carts: {
      title: 'All Carts',

      actions: {
        newCart: 'New',
      },
    },

    orders: {
      title: 'Orders',
    },

    profile: {
      title: 'Profile',
      description: 'Manage your account settings and preferences.',

      actions: {
        signOut: 'Sign out',
        toggleTheme: 'Toggle theme',
      },

      errors: {
        loading: 'Error loading profile. Please try again later.',
      },
    },
  },

  pt: {
    common: {
      messages: {
        copiedToClipboard: 'Copiado para a área de transferência',
      },

      actions: {
        back: 'Voltar',
        open: 'Abrir',
        share: 'Compartilhar',
        copy: 'Copiar',
      },

      states: {
        loading: 'Carregando...',
        noContent: 'Nenhum conteúdo disponível.',
      },

      errors: {
        generic: 'Ocorreu um erro.',
        permissionRequired: 'Permissão é necessária para continuar.',
      },

      permissions: {
        camera: 'Permissão de câmera é necessária.',
        location: 'Permissão de localização é necessária.',
      },

      fallback: {
        noName: 'Sem nome',
      },
    },

    welcome: {
      description:
        'Bem-vindo ao aplicativo de orçamento! Faça seus orçamentos de produtos de forma fácil e rápida.',
      actions: {
        getStarted: 'Começar',
      },
    },

    signIn: {
      title: 'Entre na sua conta',
      description: 'Por favor, faça login para continuar',

      username: {
        label: 'Nome de usuário',
        placeholder: 'Digite seu nome de usuário',
        validation: {
          required: 'Nome de usuário é obrigatório.',
        },
      },

      password: {
        label: 'Senha',
        placeholder: 'Digite sua senha',
        validation: {
          required: 'Senha é obrigatória.',
        },
      },

      workspaceId: {
        label: 'ID do Workspace',
        placeholder: 'Digite o ID do seu workspace',
        validation: {
          required: 'ID do workspace é obrigatório.',
        },
      },

      actions: {
        submit: 'Continuar',
      },
    },

    session: {
      errors: {
        expired: 'Sua sessão expirou. Por favor, faça login novamente.',
      },
    },

    home: {
      title: 'Início',

      recentProducts: {
        title: 'Produtos recentes',

        states: {
          empty: 'Nenhum produto recente encontrado.',
        },

        errors: {
          loading: 'Não foi possível carregar os produtos recentes.',
        },
      },
    },

    search: {
      title: 'Buscar',

      input: {
        placeholder: 'Produtos, variantes e mais',
      },

      actions: {
        qrCode: 'Código QR',
      },

      states: {
        noResults: 'Nenhum resultado encontrado.',
      },

      errors: {
        loading:
          'Erro ao carregar os resultados da busca. Por favor, tente novamente mais tarde.',
      },
    },

    scanner: {
      title: 'Scanner',
    },

    product: {
      actions: {
        addToCart: 'Adicionar',
        updateCart: 'Atualizar',
      },

      states: {
        notFound: 'Produto não encontrado.',
      },

      errors: {
        loading:
          'Erro ao carregar o produto. Por favor, tente novamente mais tarde.',
      },
    },

    cart: {
      title: 'Carrinho',

      actions: {
        viewAllCarts: 'Ver todos',
        newCart: 'Novo carrinho',
        shareCart: 'Compartilhar carrinho',
        checkout: 'Finalizar compra',
      },

      states: {
        noCartFound: 'Nenhum carrinho selecionado.',
        noItems: 'Nenhum item no carrinho.',
      },
    },

    carts: {
      title: 'Todos os carrinhos',

      actions: {
        newCart: 'Novo',
      },
    },

    orders: {
      title: 'Pedidos',
    },

    profile: {
      title: 'Perfil',
      description: 'Gerencie as configurações e preferências da sua conta.',

      actions: {
        signOut: 'Sair',
        toggleTheme: 'Alternar tema',
      },

      errors: {
        loading:
          'Erro ao carregar o perfil. Por favor, tente novamente mais tarde.',
      },
    },
  },
}
