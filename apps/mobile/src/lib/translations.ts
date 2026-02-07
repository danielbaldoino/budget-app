import type { Dict } from 'i18n-js'

export const translations: Dict = {
  en: {
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

    home: {
      title: 'Home',

      recentProducts: {
        title: 'Recent products',

        errors: {
          loading: 'Unable to load recent products.',
        },

        states: {
          empty: 'No recent products found.',
        },
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

    search: {
      title: 'Search',

      input: {
        placeholder: 'Products, variants and more',
      },

      actions: {
        qrCode: 'QR Code',
      },

      errors: {
        loading: 'Error loading search results. Please try again later.',
      },

      states: {
        noResults: 'No results found.',
      },
    },

    orders: { title: 'Orders' },

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

    product: {
      actions: {
        addToCart: 'Add to cart',
      },

      errors: {
        loading: 'Error loading product. Please try again later.',
      },

      states: {
        notFound: 'Product not found.',
      },
    },

    session: {
      errors: {
        expired: 'Your session has expired. Please sign in again.',
      },
    },

    common: {
      actions: {
        back: 'Back',
        open: 'Open',
        share: 'Share',
      },

      states: {
        loading: 'Loading...',
        noContent: 'No content available.',
        error: 'An error occurred.',
      },

      fallback: {
        noName: 'No name',
      },
    },
  },

  pt: {
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

    home: {
      title: 'Início',

      recentProducts: {
        title: 'Produtos recentes',

        errors: {
          loading: 'Não foi possível carregar os produtos recentes.',
        },

        states: {
          empty: 'Nenhum produto recente encontrado.',
        },
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

    search: {
      title: 'Buscar',

      input: {
        placeholder: 'Produtos, variantes e mais',
      },

      actions: {
        qrCode: 'Código QR',
      },

      errors: {
        loading:
          'Erro ao carregar os resultados da busca. Por favor, tente novamente mais tarde.',
      },

      states: {
        noResults: 'Nenhum resultado encontrado.',
      },
    },

    orders: { title: 'Pedidos' },

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

    product: {
      actions: {
        addToCart: 'Adicionar',
      },

      errors: {
        loading:
          'Erro ao carregar o produto. Por favor, tente novamente mais tarde.',
      },

      states: {
        notFound: 'Produto não encontrado.',
      },
    },

    session: {
      errors: {
        expired: 'Sua sessão expirou. Por favor, faça login novamente.',
      },
    },

    common: {
      actions: {
        back: 'Voltar',
        open: 'Abrir',
        share: 'Compartilhar',
      },

      states: {
        loading: 'Carregando...',
        noContent: 'Nenhum conteúdo disponível.',
        error: 'Ocorreu um erro.',
      },

      fallback: {
        noName: 'Sem nome',
      },
    },
  },
}
