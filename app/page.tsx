'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, AtSign, CakeSlice, Check, Coffee, Minus, Plus, Search, ShoppingBag, Sparkles, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type SizeOption = { label: string; price: number };
type Category = { id: string; name: string; eyebrow: string; description: string; sizes: SizeOption[]; flavors: string[]; badge?: string };
type CartItem = { key: string; category: string; flavor: string; size: string; price: number; quantity: number };

const cakeFlavors = ['Brigadeiro', 'Chocolate com morango', 'Ninho', 'Ninho com morango', 'Prestígio', 'Cenoura com chocolate', 'Oreo', 'Casadinho', 'Ferrero Rocher', 'Tapioca', 'Churros', 'Maracujá', 'Red velvet'];

const categories: Category[] = [
  { id: 'caseirinhos', name: 'Bolo caseirinho', eyebrow: 'Afeto em cada fatia', description: 'Massa macia, cobertura generosa e sabor de casa.', sizes: [{ label: '18 cm', price: 55 }, { label: '20 cm', price: 65 }, { label: '22 cm', price: 75 }], flavors: cakeFlavors, badge: 'Queridinho' },
  { id: 'simples', name: 'Bolo simples', eyebrow: 'Clássicos do café', description: 'Leves, caseiros e perfeitos para qualquer hora.', sizes: [{ label: '18 cm', price: 25 }, { label: '20 cm', price: 30 }, { label: '22 cm', price: 35 }], flavors: ['Formigueiro', 'Branco', 'Chocolate', 'Romeu e Julieta', 'Banana', 'Mesclado', 'Goiabada', 'Cenoura', 'Cenoura com chocolate', 'Maracujá', 'Casadinho'] },
  { id: 'vulcao', name: 'Bolo vulcão', eyebrow: 'Cobertura que transborda', description: 'Para quem acredita que recheio nunca é demais.', sizes: [{ label: '18 cm', price: 60 }, { label: '20 cm', price: 70 }, { label: '22 cm', price: 80 }], flavors: [...cakeFlavors.slice(0, 5), 'Limão', 'Kinder Bueno', ...cakeFlavors.slice(5)], badge: 'Bem recheado' },
  { id: 'caramelizados', name: 'Bolo caramelizado', eyebrow: 'Brilho e sabor', description: 'Frutas douradas em uma massa delicada e úmida.', sizes: [{ label: '18 cm', price: 30 }, { label: '20 cm', price: 40 }, { label: '22 cm', price: 50 }], flavors: ['Abacaxi', 'Banana'] },
  { id: 'naked', name: 'Naked cake', eyebrow: 'Para celebrar bonito', description: 'Camadas aparentes, acabamento artesanal e muita presença.', sizes: [{ label: '16 cm', price: 140 }, { label: '18 cm', price: 150 }, { label: '20 cm', price: 160 }, { label: '25 cm', price: 190 }], flavors: [...cakeFlavors, 'Chocolate com cereal', 'Doce de leite com coco', 'Brownie', 'Bem-casado', 'Caramelo com chocolate'], badge: 'Para festas' },
  { id: 'pote', name: 'Bolo no pote', eyebrow: 'Doce na medida', description: 'Camadas cremosas em um pote individual de 250 ml.', sizes: [{ label: '250 ml', price: 19 }], flavors: ['Ninho com morango', 'Brigadeiro com pedaços de chocolate', 'Brownie com chocolate', 'Brownie ninho com morango', 'Bombom de morango', 'Bombom de uva', 'Chocolate com cereal', 'Cenoura', 'Ferrero Rocher', 'Ninho'] },
  { id: 'doces-tradicionais', name: 'Doces tradicionais', eyebrow: 'Pequenas alegrias', description: 'Unidades clássicas para montar sua mesa do seu jeito.', sizes: [{ label: 'Unidade', price: 2 }], flavors: ['Brigadeiro', 'Brigadeiro branco', 'Casadinho', 'Beijinho', 'Churros', 'Uva coberta', 'Cocadinha', 'Queijadinha', 'Empada doce', 'Ninho', 'Ferrero', 'Oreo', 'Quadradinho de brownie', 'Ninho com Nutella', 'Romeu e Julieta', 'Olho de sogra'] },
  { id: 'doces-finos', name: 'Doces finos', eyebrow: 'Um toque especial', description: 'Acabamento delicado para festas e momentos marcantes.', sizes: [{ label: 'Unidade', price: 2.5 }], flavors: ['Morango coberto', 'Copinho de limão', 'Copinho de maracujá', 'Copinho de morango', 'Copinho dois amores', 'Nozes', 'Prestígio', 'Bis', 'Ferrero Rocher', 'Bombom de ameixa', 'Bombom de brownie', 'Bombom sequilho', 'Ninho com Nutella', 'Balinha de coco', 'Bombom de caramelo', 'Tortelete de brigadeiro', 'Tortelete casadinho', 'Tortelete doce de leite', 'Tortelete de limão'] },
  { id: 'pao-metro', name: 'Pão metro', eyebrow: 'Para compartilhar', description: 'Cinquenta centímetros de recheio, ideal para encontros.', sizes: [{ label: '50 cm', price: 90 }], flavors: ['Atum', 'Misto', 'Frango', 'Queijo'] },
  { id: 'brownie', name: 'Brownie', eyebrow: 'Crocante e cremoso', description: 'Chocolate intenso em versões simples ou recheadas.', sizes: [{ label: 'Sem recheio', price: 4 }, { label: 'Recheado', price: 8 }], flavors: ['Doce de leite', 'Casadinho', 'Chocolate', 'Ninho com morango', 'Ferrero', 'Ninho', 'Chocolate com morango'] },
  { id: 'tortas', name: 'Tortas', eyebrow: 'Camadas de felicidade', description: 'Feitas para serem o centro da mesa e da comemoração.', sizes: [{ label: '16 cm', price: 140 }, { label: '18 cm', price: 150 }, { label: '20 cm', price: 160 }, { label: '22 cm', price: 190 }], flavors: ['Brigadeiro', 'Chocolate com morango', 'Ninho', 'Ninho com morango', 'Prestígio', 'Abacaxi', 'Kinder Bueno', 'Oreo', 'Casadinho', 'Ferrero Rocher', 'Tapioca', 'Churros', 'Maracujá', 'Doce de leite com coco', 'Chocolate com cereal', 'Bem-casado'], badge: 'Celebre' },
];

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function ProductCard({ category, flavor, onAdd }: { category: Category; flavor: string; onAdd: (item: Omit<CartItem, 'key'>) => void }) {
  const [quantity, setQuantity] = useState(0);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [added, setAdded] = useState(false);
  const isSingleOption = category.sizes.length === 1;
  const changeQuantity = (next: number) => { const safe = Math.max(0, next); setQuantity(safe); if (safe === 0) setSelectedSize(null); if (safe > 0 && isSingleOption) setSelectedSize(category.sizes[0]); };
  const add = () => { if (!quantity || !selectedSize) return; onAdd({ category: category.name, flavor, size: selectedSize.label, price: selectedSize.price, quantity }); setAdded(true); setTimeout(() => setAdded(false), 1400); setQuantity(0); setSelectedSize(null); };

  return <article className="product-card">
    <div className="photo-placeholder" aria-label="Espaço reservado para foto do produto"><CakeSlice size={22} aria-hidden="true" /><span>A foto será<br />inserida aqui</span></div>
    <div className="product-content">
      <div className="product-topline"><h3>{flavor}</h3><span className="price-from">a partir de {money(Math.min(...category.sizes.map((size) => size.price)))}</span></div>
      <div className="quantity-row"><span>Quantidade</span><div className="stepper" aria-label={`Quantidade de ${flavor}`}><button type="button" onClick={() => changeQuantity(quantity - 1)} disabled={quantity === 0} aria-label="Diminuir quantidade"><Minus /></button><output aria-live="polite">{quantity}</output><button type="button" onClick={() => changeQuantity(quantity + 1)} aria-label="Aumentar quantidade"><Plus /></button></div></div>
      {quantity > 0 && <div className="size-area is-enabled"><div className="size-label"><span>{isSingleOption ? 'Opção' : 'Escolha o tamanho'}</span></div><div className="size-grid">{category.sizes.map((size) => <button type="button" key={size.label} className={selectedSize?.label === size.label ? 'selected' : ''} onClick={() => setSelectedSize(size)}><span>{size.label}</span><strong>{money(size.price)}</strong></button>)}</div></div>}
      <button className={`add-button ${added ? 'added' : ''}`} type="button" disabled={!quantity || !selectedSize} onClick={add}>{added ? <><Check /> Adicionado!</> : <><ShoppingBag /> Adicionar ao carrinho</>}</button>
    </div>
  </article>;
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const category = categories.find((item) => item.id === activeCategory) ?? categories[0];
  const visibleFlavors = category.flavors.filter((flavor) => flavor.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR').trim()));
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const addToCart = (newItem: Omit<CartItem, 'key'>) => { const key = `${newItem.category}-${newItem.flavor}-${newItem.size}`; setCart((current) => { const existing = current.find((item) => item.key === key); if (existing) return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + newItem.quantity } : item); return [...current, { ...newItem, key }]; }); };
  const updateCartQuantity = (key: string, quantity: number) => setCart((current) => quantity <= 0 ? current.filter((item) => item.key !== key) : current.map((item) => item.key === key ? { ...item, quantity } : item));
  const whatsappUrl = useMemo(() => { const lines = cart.map((item) => `• ${item.quantity}x ${item.category} — ${item.flavor} (${item.size}) — ${money(item.price * item.quantity)}`); const message = `Olá! Gostaria de fazer este pedido na Hora do Café com Bolo:\n\n${lines.join('\n')}\n\n*Total: ${money(totalPrice)}*\n\nPodemos confirmar disponibilidade, data e forma de entrega?`; return `https://wa.me/71987698100?text=${encodeURIComponent(message)}`; }, [cart, totalPrice]);

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool: (tool: object, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: 'add_menu_item',
      title: 'Adicionar item do cardápio',
      description: 'Adiciona ao carrinho um sabor, tamanho e quantidade disponíveis no cardápio da Hora do Café com Bolo.',
      inputSchema: { type: 'object', properties: { categoryId: { type: 'string' }, flavor: { type: 'string' }, size: { type: 'string' }, quantity: { type: 'integer', minimum: 1 } }, required: ['categoryId', 'flavor', 'size', 'quantity'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        const data = input as { categoryId?: string; flavor?: string; size?: string; quantity?: number };
        const chosenCategory = categories.find((item) => item.id === data.categoryId);
        const chosenSize = chosenCategory?.sizes.find((item) => item.label === data.size);
        if (!chosenCategory || !chosenSize || !data.flavor || !chosenCategory.flavors.includes(data.flavor) || !Number.isInteger(data.quantity) || (data.quantity ?? 0) < 1) throw new Error('Item, tamanho ou quantidade inválidos.');
        const key = `${chosenCategory.name}-${data.flavor}-${chosenSize.label}`;
        setCart((current) => { const existing = current.find((item) => item.key === key); if (existing) return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + data.quantity! } : item); return [...current, { key, category: chosenCategory.name, flavor: data.flavor!, size: chosenSize.label, price: chosenSize.price, quantity: data.quantity! }]; });
        return { status: 'added', item: data.flavor, size: chosenSize.label, quantity: data.quantity };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  return <main>
    <header className="site-header"><div className="header-inner">
      <a href="#inicio" className="brand" aria-label="Hora do Café com Bolo — início"><Image src="/logo-hora-do-cafe.png" width={56} height={56} alt="Logo Hora do Café com Bolo" priority /><div><span>Hora do</span><strong>Café com Bolo</strong></div></a>
      <nav aria-label="Navegação principal"><a href="#cardapio">Cardápio</a><a href="#sobre">Sobre</a><a href="#contato">Contato</a></nav>
      <Sheet open={cartOpen} onOpenChange={setCartOpen}><SheetTrigger className="cart-trigger" aria-label={`Abrir carrinho com ${totalItems} itens`}><ShoppingBag /><span className="cart-label">Carrinho</span><span className="cart-count">{totalItems}</span></SheetTrigger><SheetContent className="cart-sheet"><SheetHeader className="cart-header"><span className="section-kicker">Seu pedido</span><SheetTitle>Quase na hora do café</SheetTitle><SheetDescription>Revise os itens antes de enviar o pedido pelo WhatsApp.</SheetDescription></SheetHeader>
        {cart.length === 0 ? <div className="empty-cart"><div><ShoppingBag /></div><h3>Seu carrinho está vazio</h3><p>Escolha um sabor, a quantidade e o tamanho para começar.</p><button type="button" onClick={() => setCartOpen(false)}>Ver cardápio</button></div> : <><div className="cart-items">{cart.map((item) => <article className="cart-item" key={item.key}><div className="cart-item-heading"><div><small>{item.category}</small><h3>{item.flavor}</h3><p>{item.size} · {money(item.price)} cada</p></div><button type="button" onClick={() => updateCartQuantity(item.key, 0)} aria-label={`Remover ${item.flavor}`}><Trash2 /></button></div><div className="cart-item-footer"><div className="stepper"><button type="button" onClick={() => updateCartQuantity(item.key, item.quantity - 1)}><Minus /></button><output>{item.quantity}</output><button type="button" onClick={() => updateCartQuantity(item.key, item.quantity + 1)}><Plus /></button></div><strong>{money(item.price * item.quantity)}</strong></div></article>)}</div><div className="cart-summary"><div><span>Total estimado</span><strong>{money(totalPrice)}</strong></div><p>Disponibilidade, prazo e entrega serão confirmados no atendimento.</p><a href={whatsappUrl} target="_blank" rel="noreferrer" className="whatsapp-button">Confirmar pelo WhatsApp <ArrowRight /></a></div></>}
      </SheetContent></Sheet>
    </div></header>

    <section className="intro" id="inicio"><div className="intro-copy"><span className="eyebrow"><Sparkles /> Feito com carinho em Salvador</span><h1>Seu momento mais doce começa aqui.</h1><p>Escolha seus sabores, defina o tamanho e monte um pedido do seu jeitinho.</p><a href="#cardapio">Escolher delícias <ArrowRight /></a></div><div className="intro-art"><div className="brand-orbit"><span>feito à mão</span><span>desde o primeiro carinho</span></div><Image src="/logo-hora-do-cafe.png" width={360} height={360} alt="Ilustração da marca Hora do Café com Bolo" priority /><span className="floating-note">Um café.<br /><strong>Um bolo.</strong><br />Uma pausa feliz.</span></div></section>

    <section className="menu-section" id="cardapio"><div className="section-heading"><div><span className="section-kicker">Nosso cardápio</span><h2>O que deixa seu dia melhor?</h2></div><label className="search-field"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar em ${category.name.toLowerCase()}...`} aria-label="Buscar sabor" /></label></div>
      <div className="category-strip" aria-label="Categorias">{categories.map((item) => <button key={item.id} type="button" className={activeCategory === item.id ? 'active' : ''} onClick={() => { setActiveCategory(item.id); setQuery(''); }}>{item.name}</button>)}</div>
      <div className="category-banner"><div><span>{category.eyebrow}</span><h2>{category.name}</h2><p>{category.description}</p></div><div className="banner-meta">{category.badge && <span><Sparkles /> {category.badge}</span>}<strong>{category.flavors.length} sabores</strong></div></div>
      <div className="selection-tip"><div><Coffee /></div><p><strong>É simples:</strong> escolha a quantidade e, em seguida, selecione o tamanho para liberar o botão de adicionar.</p></div>
      {visibleFlavors.length ? <div className="product-grid">{visibleFlavors.map((flavor) => <ProductCard key={`${category.id}-${flavor}`} category={category} flavor={flavor} onAdd={addToCart} />)}</div> : <div className="no-results"><Search /><h3>Nenhum sabor encontrado</h3><p>Tente outra busca ou navegue pelas categorias.</p><button type="button" onClick={() => setQuery('')}>Limpar busca</button></div>}
    </section>

    <section className="about" id="sobre"><div className="about-mark"><Image src="/logo-hora-do-cafe.png" width={250} height={250} alt="Hora do Café com Bolo" /></div><div className="about-copy"><span className="section-kicker">Do nosso forno para você</span><h2>Receitas que têm gosto de abraço.</h2><p>Acreditamos nas pequenas pausas que viram grandes memórias. Por isso, cada pedido é preparado com cuidado, ingredientes escolhidos e aquele toque caseiro que faz toda diferença.</p><a href="https://instagram.com/horadocafecombolo" target="_blank" rel="noreferrer"><AtSign /> Acompanhe no Instagram</a></div></section>
    <footer id="contato"><div className="footer-brand"><Image src="/logo-hora-do-cafe.png" width={64} height={64} alt="" /><div><strong>Hora do Café com Bolo</strong><span>Doçura feita com afeto.</span></div></div><div className="footer-links"><a href="https://instagram.com/horadocafecombolo" target="_blank" rel="noreferrer"><AtSign /> @horadocafecombolo</a><a href="https://wa.me/71987698100" target="_blank" rel="noreferrer">WhatsApp: (71) 98769-8100</a></div><div className="developer">Desenvolvido com cuidado por <a href="https://instagram.com/yg.systems" target="_blank" rel="noreferrer">@yg.systems</a></div></footer>
    {totalItems > 0 && <button className="mobile-cart" type="button" onClick={() => setCartOpen(true)}><span><ShoppingBag /> {totalItems} {totalItems === 1 ? 'item' : 'itens'}</span><strong>{money(totalPrice)}</strong></button>}
  </main>;
}
