'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  CakeSlice,
  Coffee,
  LockKeyhole,
  Minus,
  Pencil,
  Plus,
  Save,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  defaultContent,
  type Category,
  type Flavor,
  type SiteContent,
  type SizeOption,
} from '@/lib/catalog';

type CartItem = {
  key: string;
  category: string;
  flavor: string;
  size: string;
  price: number;
  quantity: number;
};
const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const LOCAL_CONTENT_KEY = 'hora-cafe-content-v1';
const LOCAL_ORDERS_KEY = 'hora-cafe-orders-v1';
type LocalOrder = {
  id: string;
  name: string;
  deliveryDate: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'delivered';
  createdAt: string;
};
const publicAsset = (source: string) =>
  source.startsWith('/') ? `${publicBasePath}${source}` : source;

function Card({
  category,
  flavor,
  add,
}: {
  category: Category;
  flavor: Flavor;
  add: (item: Omit<CartItem, 'key'>) => void;
}) {
  const [quantity, setQuantity] = useState(0);
  const [quantityText, setQuantityText] = useState('');
  const [size, setSize] = useState<SizeOption | null>(null);
  const single = category.sizes.length === 1;
  const updateQuantity = (next: number) => {
    next = Math.max(0, next);
    setQuantity(next);
    setQuantityText(next ? String(next) : '');
    setSize(next && single ? category.sizes[0] : next ? size : null);
  };
  return (
    <article className="product-card">
      <div className="product-photo">
        {flavor.image ? (
          <img src={flavor.image} alt={flavor.name} />
        ) : (
          <>
            <CakeSlice />
            <span>
              Foto do produto
              <br />
              em breve
            </span>
          </>
        )}
      </div>
      <div className="product-content">
        <div className="product-topline">
          <h3>{flavor.name}</h3>
          <span className="price-from">
            a partir de {money(Math.min(...category.sizes.map((s) => s.price)))}
          </span>
        </div>
        <div className="quantity-row">
          <span>Quantidade</span>
          <div className="stepper">
            <button
              onClick={() => updateQuantity(quantity - 1)}
              disabled={!quantity}
            >
              <Minus />
            </button>
            <input
              aria-label={`Quantidade de ${flavor.name}`}
              inputMode="numeric"
              type="text"
              value={quantityText}
              placeholder="0"
              onChange={(event) => {
                const clean = event.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                setQuantityText(clean);
                updateQuantity(Number(clean) || 0);
              }}
            />
            <button onClick={() => updateQuantity(quantity + 1)}>
              <Plus />
            </button>
          </div>
        </div>
        {quantity > 0 && (
          <div className="size-area is-enabled">
            <div className="size-label">
              <span>{single ? 'Opção' : 'Escolha o tamanho'}</span>
            </div>
            <div className="size-grid">
              {category.sizes.map((s) => (
                <button
                  key={s.label}
                  className={size?.label === s.label ? 'selected' : ''}
                  onClick={() => setSize(s)}
                >
                  <span>{s.label}</span>
                  <strong>{money(s.price)}</strong>
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          className="add-button"
          disabled={!quantity || !size}
          onClick={() => {
            if (size) {
              add({
                category: category.name,
                flavor: flavor.name,
                size: size.label,
                price: size.price,
                quantity,
              });
              setQuantity(0);
              setQuantityText('');
              setSize(null);
            }
          }}
        >
          <ShoppingBag /> Adicionar ao carrinho
        </button>
      </div>
    </article>
  );
}

function CategoryRail({
  categories,
  active,
  onSelect,
}: {
  categories: Category[];
  active: string;
  onSelect: (id: string) => void;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const dragging = useRef(false);
  const moved = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const direction = useRef(1);
  const resumeTimer = useRef<number | undefined>(undefined);

  const resumeLater = () => {
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      paused.current = false;
    }, 2200);
  };

  useEffect(() => {
    let frame = 0;
    const move = () => {
      const node = rail.current;
      if (
        node &&
        !paused.current &&
        !dragging.current &&
        node.scrollWidth > node.clientWidth
      ) {
        const limit = node.scrollWidth - node.clientWidth;
        if (node.scrollLeft >= limit - 1) direction.current = -1;
        if (node.scrollLeft <= 1) direction.current = 1;
        node.scrollLeft += direction.current * 0.28;
      }
      frame = requestAnimationFrame(move);
    };
    frame = requestAnimationFrame(move);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(resumeTimer.current);
    };
  }, []);

  return (
    <div
      ref={rail}
      className="category-strip"
      aria-label="Categorias"
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        dragging.current = false;
        resumeLater();
      }}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest('button')) {
          paused.current = true;
          moved.current = false;
          return;
        }
        dragging.current = true;
        moved.current = false;
        paused.current = true;
        startX.current = event.clientX;
        startScroll.current = rail.current?.scrollLeft ?? 0;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (dragging.current && rail.current) {
          if (Math.abs(event.clientX - startX.current) > 6)
            moved.current = true;
          rail.current.scrollLeft =
            startScroll.current - (event.clientX - startX.current);
        }
      }}
      onPointerUp={(event) => {
        const wasDragging = dragging.current;
        dragging.current = false;
        resumeLater();
        if (wasDragging && event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {
        dragging.current = false;
        resumeLater();
      }}
    >
      {categories.map((item) => (
        <button
          key={item.id}
          className={active === item.id ? 'active' : ''}
          onPointerUp={() => {
            if (!moved.current) onSelect(item.id);
          }}
          onClick={() => {
            if (!moved.current) onSelect(item.id);
          }}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

function Admin({
  content,
  save,
}: {
  content: SiteContent;
  save: (next: SiteContent) => Promise<void>;
}) {
  const [logged, setLogged] = useState(false),
    [username, setUsername] = useState(''),
    [password, setPassword] = useState(''),
    [error, setError] = useState(''),
    [saved, setSaved] = useState(false),
    [orders, setOrders] = useState<LocalOrder[]>([]),
    [draft, setDraft] = useState(content),
    [selected, setSelected] = useState(0),
    [saving, setSaving] = useState(false);
  useEffect(() => setDraft(content), [content]);
  useEffect(() => {
    try { setOrders(JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) ?? '[]')); } catch { setOrders([]); }
  }, []);
  const c = draft.categories[selected];
  const login = (event: React.FormEvent) => {
    event.preventDefault();
    if (username.trim().toLowerCase() === 'admin' && password === 'admin')
      setLogged(true);
    else setError('Usuário ou senha inválidos.');
  };
  const category = (patch: Partial<Category>) =>
    setDraft((d) => ({
      ...d,
      categories: d.categories.map((item, i) =>
        i === selected ? { ...item, ...patch } : item,
      ),
    }));
  const upload = (file: File, done: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') done(reader.result);
      else setError('Falha ao ler a imagem.');
    };
    reader.onerror = () => setError('Falha ao ler a imagem.');
    reader.readAsDataURL(file);
  };
  if (!logged)
    return (
      <main className="admin-login">
        <a href={publicBasePath || '/'}>← Voltar ao cardápio</a>
        <form onSubmit={login}>
          <LockKeyhole />
          <h1>Área administrativa</h1>
          <p>Entre para atualizar o cardápio.</p>
          <label>
            Usuário
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <small>{error}</small>}
          <button>Entrar</button>
        </form>
      </main>
    );
  return (
    <main className="admin-page">
      <header>
        <a href={publicBasePath || '/'}>← Ver cardápio</a>
        <button
          onClick={async () => {
            setSaving(true);
            setSaved(false);
            try {
              await save(draft);
              setError('');
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2600);
            } catch {
              setError('Não foi possível salvar. O armazenamento do navegador pode estar cheio.');
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
        >
          <Save /> {saving ? 'Salvando…' : saved ? 'Salvo com sucesso' : 'Salvar alterações'}
        </button>
      </header>
      <section className="admin-settings">
        <div>
          <span>Conteúdo principal</span>
          <label>
            Título do header
            <input
              value={draft.heroTitle}
              onChange={(e) =>
                setDraft({ ...draft, heroTitle: e.target.value })
              }
            />
          </label>
          <label>
            Texto do header
            <textarea
              value={draft.heroText}
              onChange={(e) => setDraft({ ...draft, heroText: e.target.value })}
            />
          </label>
        </div>
        <div className="admin-image">
          {draft.heroImage && <img src={draft.heroImage} alt="Prévia" />}
          <label className="upload">
            <Upload /> Trocar imagem
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f)
                      upload(f, (url) =>
                    setDraft({ ...draft, heroImage: url }),
                  );
              }}
            />
          </label>
        </div>
      </section>
      <section className="admin-orders">
        <div className="editor-heading"><ShoppingBag /><div><h1>Pedidos</h1><p>Resumo local dos pedidos enviados pelo WhatsApp.</p></div></div>
        <div className="orders-summary"><strong>{orders.filter((order) => order.status === 'pending').length} pendentes</strong><strong>{money(orders.reduce((sum, order) => sum + order.total, 0))} em pedidos</strong></div>
        {orders.length === 0 ? <p className="admin-muted">Nenhum pedido registrado neste navegador.</p> : orders.map((order) => (
          <article className="admin-order" key={order.id}>
            <div><strong>{order.name}</strong><span>Entrega: {order.deliveryDate.split('-').reverse().join('/')}</span></div>
            <p>{order.items.map((item) => `${item.quantity}x ${item.flavor}`).join(' · ')}</p>
            <div><b>{money(order.total)}</b><button onClick={() => { const next = orders.map((item) => item.id === order.id ? { ...item, status: 'delivered' as const } : item); setOrders(next); localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(next)); }}>{order.status === 'pending' ? 'Marcar como entregue' : 'Pedido realizado'}</button></div>
          </article>
        ))}
      </section>
      <div className="admin-layout">
        <aside>
          <strong>Categorias</strong>
          {draft.categories.map((item, i) => (
            <button
              className={i === selected ? 'selected' : ''}
              key={item.id}
              onClick={() => setSelected(i)}
            >
              {item.name}
            </button>
          ))}
          <button
            className="add-line"
            onClick={() => {
              const next: Category = {
                id: `categoria-${Date.now()}`,
                name: 'Nova categoria',
                eyebrow: 'Feito com carinho',
                description: 'Descreva esta categoria do seu cardápio.',
                sizes: [{ label: 'Unidade', price: 0 }],
                flavors: [],
              };
              setDraft((current) => ({ ...current, categories: [...current.categories, next] }));
              setSelected(draft.categories.length);
            }}
          >
            <Plus /> Nova categoria
          </button>
        </aside>
        <section className="editor">
          <div className="editor-heading">
            <Pencil />
            <div>
              <h1>{c.name}</h1>
              <p>Edite tudo que aparece para os clientes.</p>
            </div>
          </div>
          <div className="editor-fields">
            <label>
              Nome
              <input
                value={c.name}
                onChange={(e) => category({ name: e.target.value })}
              />
            </label>
            <label>
              Chamada
              <input
                value={c.eyebrow}
                onChange={(e) => category({ eyebrow: e.target.value })}
              />
            </label>
            <label>
              Descrição
              <textarea
                value={c.description}
                onChange={(e) => category({ description: e.target.value })}
              />
            </label>
            <label>
              Selo
              <input
                value={c.badge ?? ''}
                onChange={(e) => category({ badge: e.target.value })}
              />
            </label>
          </div>
          <h2>Tamanhos e preços</h2>
          {c.sizes.map((s, i) => (
            <div className="admin-row" key={i}>
              <input
                value={s.label}
                onChange={(e) =>
                  category({
                    sizes: c.sizes.map((x, n) =>
                      n === i ? { ...x, label: e.target.value } : x,
                    ),
                  })
                }
              />
              <input
                type="number"
                min="0"
                step="0.5"
                value={s.price || ''}
                onChange={(e) =>
                  category({
                    sizes: c.sizes.map((x, n) =>
                      n === i
                        ? { ...x, price: e.target.value === '' ? 0 : Number(e.target.value.replace(/^0+(?=\d)/, '')) }
                        : x,
                    ),
                  })
                }
              />
              <button
                className="icon-delete"
                onClick={() =>
                  category({ sizes: c.sizes.filter((_, n) => n !== i) })
                }
              >
                <X />
              </button>
            </div>
          ))}
          <button
            className="add-line"
            onClick={() =>
              category({
                sizes: [...c.sizes, { label: 'Novo tamanho', price: 0 }],
              })
            }
          >
            <Plus /> Adicionar tamanho
          </button>
          <h2>Itens e fotos</h2>
          {c.flavors.map((f, i) => (
            <div className="flavor-editor" key={f.id}>
              {f.image ? (
                <img src={f.image} alt="" />
              ) : (
                <div className="thumb">
                  <CakeSlice />
                </div>
              )}
              <input
                value={f.name}
                onChange={(e) =>
                  category({
                    flavors: c.flavors.map((x, n) =>
                      n === i ? { ...x, name: e.target.value } : x,
                    ),
                  })
                }
              />
              <label className="upload small">
                <Upload />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      upload(file, (url) =>
                        category({
                          flavors: c.flavors.map((x, n) =>
                            n === i ? { ...x, image: url } : x,
                          ),
                        }),
                      );
                  }}
                />
              </label>
              <button
                className="icon-delete"
                onClick={() =>
                  category({ flavors: c.flavors.filter((_, n) => n !== i) })
                }
              >
                <Trash2 />
              </button>
            </div>
          ))}
          <button
            className="add-line"
            onClick={() =>
              category({
                flavors: [
                  ...c.flavors,
                  { id: crypto.randomUUID(), name: 'Novo item' },
                ],
              })
            }
          >
            <Plus /> Adicionar item
          </button>
          {error && <p className="admin-error">{error}</p>}
        </section>
      </div>
    </main>
  );
}

export function Storefront() {
  const [content, setContent] = useState(defaultContent),
    [active, setActive] = useState(defaultContent.categories[0].id),
    [query, setQuery] = useState(''),
    [cart, setCart] = useState<CartItem[]>([]),
    [cartOpen, setCartOpen] = useState(false),
    [cartPulse, setCartPulse] = useState(false),
    [customerName, setCustomerName] = useState(''),
    [deliveryDate, setDeliveryDate] = useState(''),
    [admin, setAdmin] = useState(false);
  useEffect(() => {
    setAdmin(new URLSearchParams(window.location.search).has('admin'));
  }, []);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CONTENT_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as SiteContent;
      if (parsed?.categories?.length) {
        setContent(parsed);
        setActive(parsed.categories[0].id);
      }
    } catch {
      // Corrupt or unavailable local data falls back to the built-in catalog.
    }
  }, []);
  const c =
      content.categories.find((item) => item.id === active) ??
      content.categories[0],
    items = c.flavors.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()),
    ),
    count = cart.reduce((sum, item) => sum + item.quantity, 0),
    total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const add = (item: Omit<CartItem, 'key'>) => {
    setCart((current) => {
      const key = `${item.category}-${item.flavor}-${item.size}`,
        old = current.find((x) => x.key === key);
      return old
        ? current.map((x) =>
            x.key === key ? { ...x, quantity: x.quantity + item.quantity } : x,
          )
        : [...current, { ...item, key }];
    });
    setCartPulse(true);
    window.setTimeout(() => setCartOpen(true), 360);
    window.setTimeout(() => setCartPulse(false), 700);
  };
  const order = useMemo(
    () =>
      `https://wa.me/71987698100?text=${encodeURIComponent(`Olá, Café com Bolo! Eu quero solicitar:\n\n${cart.map((x) => `- ${x.quantity} - ${x.flavor} (${x.size})`).join('\n')}\n- Dia: ${deliveryDate ? deliveryDate.split('-').reverse().join('/') : ''}\n- Nome: ${customerName}\n\nTotal: ${money(total)}`)}`,
    [cart, total, customerName, deliveryDate],
  );
  const orderReady = cart.length > 0 && customerName.trim().length > 1 && Boolean(deliveryDate);
  const confirmOrder = () => {
    if (!orderReady) return;
    try {
      const record: LocalOrder = {
        id: `pedido-${Date.now()}`,
        name: customerName.trim(),
        deliveryDate,
        items: cart,
        total,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      const previous = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) ?? '[]') as LocalOrder[];
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([...previous, record]));
    } catch {
      // O WhatsApp continua sendo aberto mesmo se o armazenamento local estiver indisponível.
    }
  };
  if (admin)
    return (
      <Admin
        content={content}
        save={async (next) => {
          localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(next));
          setContent(next);
        }}
      />
    );
  return (
    <main>
      <button className={`cart-trigger cart-floating ${cartPulse ? 'cart-arrived' : ''}`} onClick={() => setCartOpen(!cartOpen)}>
        <ShoppingBag />
        <span className="cart-label">Carrinho</span>
        <span className="cart-count">{count}</span>
      </button>
      {cartOpen && (
        <>
          <div className="cart-backdrop" onClick={() => setCartOpen(false)} />
          <aside className="quick-cart">
          <button className="close-cart" onClick={() => setCartOpen(false)}>
            <X />
          </button>
          <h2>Seu pedido</h2>
          {cart.length ? (
            <>
              {cart.map((x) => (
                <div key={x.key}>
                  <span>
                    {x.quantity}x {x.flavor}
                    <small>{x.size}</small>
                  </span>
                  <strong>{money(x.price * x.quantity)}</strong>
                </div>
              ))}
              <h3>
                Total <strong>{money(total)}</strong>
              </h3>
              <label className="order-field">
                Nome para o pedido
                <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Seu nome" />
              </label>
              <label className="order-field">
                Data de entrega
                <input type="date" min={new Date().toISOString().slice(0, 10)} value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} />
              </label>
              <a className={!orderReady ? 'is-disabled' : ''} href={orderReady ? order : '#'} target="_blank" rel="noreferrer" onClick={(event) => { if (!orderReady) event.preventDefault(); else confirmOrder(); }}>
                Confirmar pelo WhatsApp <ArrowRight />
              </a>
            </>
          ) : (
            <p>Seu carrinho está vazio.</p>
          )}
          </aside>
        </>
      )}
      <section className="intro" id="inicio">
        <div className="intro-copy">
          <span className="eyebrow">
            <Sparkles /> Feito com carinho em Salvador
          </span>
          <h1>{content.heroTitle}</h1>
          <p>{content.heroText}</p>
          <a href="#cardapio">
            Escolher delícias <ArrowRight />
          </a>
        </div>
        <div className="intro-art">
          <div className="brand-orbit">
            <span>feito à mão</span>
            <span>desde o primeiro carinho</span>
          </div>
          <img
            className="chef-hero"
            src={publicAsset(content.heroImage)}
            alt="Confeiteira da Hora do Café com Bolo"
          />
          <span className="floating-note">
            Um café.
            <br />
            <strong>Um bolo.</strong>
          </span>
        </div>
      </section>
      <section className="menu-section" id="cardapio">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Nosso cardápio</span>
            <h2>O que deixa seu dia melhor?</h2>
          </div>
          <label className="search-field">
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Buscar em ${c.name.toLowerCase()}...`}
            />
          </label>
        </div>
        <CategoryRail
          categories={content.categories}
          active={active}
          onSelect={(id) => {
            setActive(id);
            setQuery('');
          }}
        />
        <div className="selection-tip">
          <div>
            <Coffee />
          </div>
          <p>
            <strong>É simples:</strong> escolha a quantidade e depois o tamanho.
          </p>
        </div>
        <div className="product-grid">
          {items.map((f) => (
            <Card key={f.id} category={c} flavor={f} add={add} />
          ))}
        </div>
      </section>
      <section className="about" id="sobre">
        <div className="about-mark">
          <Image
            src={publicAsset('/logo-hora-do-cafe.png')}
            width={250}
            height={250}
            alt="Hora do Café com Bolo"
          />
        </div>
        <div className="about-copy">
          <span className="section-kicker">Do nosso forno para você</span>
          <h2>Receitas que têm gosto de abraço.</h2>
          <p>
            Pedidos preparados com cuidado, ingredientes escolhidos e aquele
            toque caseiro.
          </p>
        </div>
      </section>
      <footer id="contato">
        <div className="footer-brand">
          <Image
            src={publicAsset('/logo-hora-do-cafe.png')}
            width={64}
            height={64}
            alt=""
          />
          <div>
            <strong>Hora do Café com Bolo</strong>
            <span>Doçura feita com afeto.</span>
          </div>
        </div>
        <div className="footer-links">
          <a href="https://instagram.com/horadocafecombolo">
            @horadocafecombolo
          </a>
          <a href="https://wa.me/71987698100">WhatsApp: (71) 98769-8100</a>
        </div>
        <div className="developer">
          Desenvolvido por @yg.systems ·{' '}
          <a href={`${publicBasePath}/cardapio?admin`}>Administração</a>
        </div>
      </footer>
    </main>
  );
}

export default function CountdownIntro() {
  const [count, setCount] = useState(5);
  const [phase, setPhase] = useState<'countdown' | 'message' | 'logo' | 'leaving'>('countdown');

  useEffect(() => {
    const destination = `${publicBasePath}/cardapio`;
    const wantsAdmin = new URLSearchParams(window.location.search).has('admin');
    if (wantsAdmin) {
      window.location.replace(`${destination}?admin`);
      return;
    }
    let current = 5;
    const interval = window.setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCount(current);
        return;
      }
      window.clearInterval(interval);
      try { sessionStorage.setItem('hora-intro-seen', 'yes'); } catch {}
      setPhase('message');
    }, 1000);
    const showLogo = window.setTimeout(() => setPhase('logo'), 7000);
    const fade = window.setTimeout(() => setPhase('leaving'), 8600);
    const navigate = window.setTimeout(() => window.location.replace(destination), 9500);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(showLogo);
      window.clearTimeout(fade);
      window.clearTimeout(navigate);
    };
  }, []);

  const skip = () => {
    try { sessionStorage.setItem('hora-intro-seen', 'yes'); } catch {}
    setPhase('leaving');
    window.setTimeout(() => window.location.replace(`${publicBasePath}/cardapio`), 420);
  };

  return (
    <main className={`countdown-page ${phase === 'leaving' ? 'is-leaving' : ''}`}>
      <div className="countdown-glow" aria-hidden="true" />
      <div className="countdown-content">
        {phase === 'countdown' && (
          <>
            <Image className="countdown-logo" src={publicAsset('/favicon-cafe-com-bolo.png')} width={132} height={132} alt="Hora do Café com Bolo" priority />
            <div className="countdown-brand">Café Com Bolo</div>
          </>
        )}
        {phase === 'countdown' ? (
          <div className="countdown-stage">
            <span>Prepare a sua pausa</span>
            <strong key={count} className="countdown-number">00:00:{String(count).padStart(2, '0')}</strong>
            <div className="countdown-progress"><i style={{ '--count': count } as React.CSSProperties} /></div>
          </div>
        ) : phase === 'message' ? (
          <output className="countdown-arrival">
            <span>O momento chegou</span>
            <h1>Chegou a hora do<br /><em>Café Com Bolo!</em></h1>
          </output>
        ) : (
          <div className="countdown-logo-reveal">
            <Image src={publicAsset('/favicon-cafe-com-bolo.png')} width={360} height={360} alt="Café Com Bolo" priority />
            <strong>Café Com Bolo</strong>
          </div>
        )}
      </div>
      <button type="button" className="countdown-skip" onClick={skip}>Pular introdução <ArrowRight /></button>
    </main>
  );
}
