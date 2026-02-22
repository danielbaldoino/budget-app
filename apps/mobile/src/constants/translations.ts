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
        save: 'Save',
        manage: 'Manage',
        viewAll: 'View all',
        select: 'Select',
        adjustments: 'Adjustments',
      },

      labels: {
        name: 'Name',
        currency: 'Currency',
        notes: 'Notes',
        subtotal: 'Subtotal',
        quantity: 'Quantity',
        totalPrice: 'Total price',
        items: 'Items: %{count}',
        createdAt: 'Created on %{date}',
      },

      states: {
        loading: 'Loading...',
        noContent: 'No content available.',
        noResults: 'No results found.',
      },

      errors: {
        generic: 'An error occurred.',
        permissionRequired: 'Permission is required to continue.',
      },

      validation: {
        nameRequired: 'Name is required.',
        notesMaxLength: 'Notes must be at most 255 characters.',
      },

      permissions: {
        camera: 'Camera permission is required.',
        location: 'Location permission is required.',
      },

      fallback: {
        noName: 'No name',
        notAvailable: 'N/A',
        noDescription: 'No description',
        noCategory: 'No category',
        noSku: 'No SKU',
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

      states: {},

      errors: {
        loading: 'Error loading search results. Please try again later.',
      },
    },

    scanner: {
      title: 'Scanner',
    },

    pricing: {
      title: 'Price list',

      fallback: {
        defaultPriceList: 'Default',
      },

      states: {
        noPrices: 'No prices defined.',
      },

      actions: {
        selectHint: 'Tap to select',
      },
    },

    priceAdjustments: {
      title: 'Price adjustments',
    },

    product: {
      labels: {
        category: 'Category',
      },

      inventory: {
        title: 'Inventory',
        actions: {
          viewInventory: 'View inventory',
        },
        status: {
          enabled: 'Enabled',
          disabled: 'Disabled',
          outOfStock: 'Out of stock',
        },
      },

      price: {
        fallback: {
          noPrice: 'No price',
        },
      },

      priceSettings: {
        title: 'Price adjustments',
      },

      variants: {
        actions: {
          viewAll: 'View all variants',
          select: 'Select a variant',
        },
      },

      form: {
        notes: {
          placeholder: 'E.g.: The product handles should have a golden finish.',
        },
      },

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
        newCart: 'New cart',
        shareCart: 'Share cart',
        checkout: 'Checkout',
      },

      states: {
        noCartFound: 'No cart selected.',
        noItems: 'No items in the cart.',
      },

      fallback: {
        noContact: 'No contact',
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

    inventory: {
      title: 'Inventory',

      labels: {
        stock: 'Stock: %{count}',
      },

      fallback: {
        noLocation: 'Location not informed',
      },
    },

    manageCart: {
      title: {
        create: 'Create cart',
        edit: 'Edit cart',
      },

      fields: {
        name: {
          placeholder: 'E.g.: Customer X quote',
        },
        currency: {
          placeholder: 'Select currency',
        },
        notes: {
          placeholder:
            'E.g.: Customer asked to include delivery time in the proposal.',
        },
      },
    },

    selectCustomer: {
      title: 'Select customer',
      search: {
        placeholder: 'Search customers',
      },
    },

    selectVariant: {
      title: 'Select variant',
      search: {
        placeholder: 'Search variants',
      },
    },

    profile: {
      title: 'Profile',
      description: 'Manage your account settings and preferences.',

      sections: {
        appearance: 'Appearance',
      },

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
        save: 'Salvar',
        manage: 'Gerenciar',
        viewAll: 'Ver todos',
        select: 'Selecionar',
        adjustments: 'Ajustes',
      },

      labels: {
        name: 'Nome',
        currency: 'Moeda',
        notes: 'Notas',
        subtotal: 'Subtotal',
        quantity: 'Quantidade',
        totalPrice: 'Preço total',
        items: 'Itens: %{count}',
        createdAt: 'Criado em %{date}',
      },

      states: {
        loading: 'Carregando...',
        noContent: 'Nenhum conteúdo disponível.',
        noResults: 'Nenhum resultado encontrado.',
      },

      errors: {
        generic: 'Ocorreu um erro.',
        permissionRequired: 'Permissão é necessária para continuar.',
      },

      validation: {
        nameRequired: 'Nome é obrigatório.',
        notesMaxLength: 'Notas devem ter no máximo 255 caracteres.',
      },

      permissions: {
        camera: 'Permissão de câmera é necessária.',
        location: 'Permissão de localização é necessária.',
      },

      fallback: {
        noName: 'Sem nome',
        notAvailable: 'N/A',
        noDescription: 'Sem descrição',
        noCategory: 'Sem categoria',
        noSku: 'Sem SKU',
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

      states: {},

      errors: {
        loading:
          'Erro ao carregar os resultados da busca. Por favor, tente novamente mais tarde.',
      },
    },

    scanner: {
      title: 'Scanner',
    },

    pricing: {
      title: 'Lista de preços',

      fallback: {
        defaultPriceList: 'Padrão',
      },

      states: {
        noPrices: 'Sem preços definidos.',
      },

      actions: {
        selectHint: 'Clique para selecionar',
      },
    },

    priceAdjustments: {
      title: 'Ajustes de preço',
    },

    product: {
      labels: {
        category: 'Categoria',
      },

      inventory: {
        title: 'Estoque',
        actions: {
          viewInventory: 'Ver inventário',
        },
        status: {
          enabled: 'Habilitado',
          disabled: 'Desabilitado',
          outOfStock: 'Sem estoque',
        },
      },

      price: {
        fallback: {
          noPrice: 'Sem preço',
        },
      },

      priceSettings: {
        title: 'Ajustes de preço',
      },

      variants: {
        actions: {
          viewAll: 'Ver todas as variantes',
          select: 'Selecionar uma variante',
        },
      },

      form: {
        notes: {
          placeholder:
            'Ex.: As maçanetas do produto devem ter acabamento dourado.',
        },
      },

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
        newCart: 'Novo carrinho',
        shareCart: 'Compartilhar carrinho',
        checkout: 'Finalizar compra',
      },

      states: {
        noCartFound: 'Nenhum carrinho selecionado.',
        noItems: 'Nenhum item no carrinho.',
      },

      fallback: {
        noContact: 'Sem contato',
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

    inventory: {
      title: 'Inventário',

      labels: {
        stock: 'Estoque: %{count}',
      },

      fallback: {
        noLocation: 'Localização não informada',
      },
    },

    manageCart: {
      title: {
        create: 'Criar carrinho',
        edit: 'Editar carrinho',
      },

      fields: {
        name: {
          placeholder: 'Ex: Orç. do cliente X',
        },
        currency: {
          placeholder: 'Selecione a moeda',
        },
        notes: {
          placeholder:
            'Ex.: O cliente pediu para incluir o prazo de entrega na proposta.',
        },
      },
    },

    selectCustomer: {
      title: 'Selecionar cliente',
      search: {
        placeholder: 'Pesquisar clientes',
      },
    },

    selectVariant: {
      title: 'Selecionar variante',
      search: {
        placeholder: 'Pesquisar variantes',
      },
    },

    profile: {
      title: 'Perfil',
      description: 'Gerencie as configurações e preferências da sua conta.',

      sections: {
        appearance: 'Aparência',
      },

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
