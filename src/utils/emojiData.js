const EMOJI_DB = [
  // ─── Business & Finance ─────────────────────────────────────────────────
  { emoji: '💰', keywords: ['money', 'finance', 'cash', 'dollar', 'budget', 'payment', 'cost', 'price', 'quote', 'invoice'] },
  { emoji: '💵', keywords: ['money', 'dollar', 'bill', 'cash', 'payment', 'finance'] },
  { emoji: '💳', keywords: ['credit', 'card', 'payment', 'purchase', 'checkout', 'billing', 'stripe'] },
  { emoji: '💲', keywords: ['dollar', 'price', 'money', 'cost', 'currency'] },
  { emoji: '💱', keywords: ['currency', 'exchange', 'forex', 'conversion', 'rate'] },
  { emoji: '🏦', keywords: ['bank', 'finance', 'money', 'account', 'deposit'] },
  { emoji: '📈', keywords: ['chart', 'growth', 'analytics', 'stocks', 'increase', 'profit', 'graph', 'trend', 'statistics'] },
  { emoji: '📉', keywords: ['chart', 'decline', 'decrease', 'loss', 'graph', 'down'] },
  { emoji: '📊', keywords: ['chart', 'graph', 'analytics', 'statistics', 'data', 'report', 'dashboard', 'metrics'] },
  { emoji: '🧾', keywords: ['receipt', 'invoice', 'bill', 'purchase', 'transaction'] },
  { emoji: '💼', keywords: ['business', 'briefcase', 'work', 'job', 'corporate', 'professional'] },
  { emoji: '🏢', keywords: ['office', 'building', 'company', 'corporate', 'business', 'enterprise'] },
  { emoji: '🏪', keywords: ['store', 'shop', 'retail', 'commerce', 'business'] },
  { emoji: '🏬', keywords: ['department', 'store', 'mall', 'shopping', 'retail'] },
  { emoji: '🛒', keywords: ['cart', 'shopping', 'ecommerce', 'store', 'purchase', 'buy'] },
  { emoji: '🛍️', keywords: ['shopping', 'bag', 'retail', 'purchase', 'store'] },
  { emoji: '💎', keywords: ['gem', 'premium', 'diamond', 'luxury', 'value', 'quality'] },
  { emoji: '🪙', keywords: ['coin', 'money', 'currency', 'token', 'crypto'] },
  { emoji: '💹', keywords: ['stocks', 'market', 'growth', 'finance', 'trading'] },
  { emoji: '🤝', keywords: ['handshake', 'deal', 'agreement', 'partnership', 'contract', 'meeting'] },

  // ─── Tools & Engineering ────────────────────────────────────────────────
  { emoji: '🔧', keywords: ['tool', 'wrench', 'settings', 'fix', 'repair', 'configure', 'utility', 'maintenance'] },
  { emoji: '🛠️', keywords: ['tools', 'hammer', 'wrench', 'build', 'construct', 'fix', 'repair', 'maintenance'] },
  { emoji: '⚙️', keywords: ['gear', 'settings', 'config', 'configuration', 'system', 'preferences', 'cog', 'engine'] },
  { emoji: '🔩', keywords: ['bolt', 'nut', 'hardware', 'engineering', 'mechanical', 'fastener'] },
  { emoji: '⛏️', keywords: ['pick', 'mine', 'mining', 'dig', 'tool'] },
  { emoji: '🪛', keywords: ['screwdriver', 'tool', 'fix', 'repair', 'hardware'] },
  { emoji: '🪚', keywords: ['saw', 'cut', 'tool', 'woodwork', 'construction'] },
  { emoji: '🔨', keywords: ['hammer', 'build', 'construct', 'tool', 'fix'] },
  { emoji: '🏗️', keywords: ['construction', 'build', 'crane', 'project', 'development', 'engineering'] },
  { emoji: '🧰', keywords: ['toolbox', 'tools', 'kit', 'maintenance', 'utility', 'repair'] },
  { emoji: '🧲', keywords: ['magnet', 'attract', 'pull', 'physics', 'force'] },
  { emoji: '⚡', keywords: ['lightning', 'electric', 'power', 'fast', 'quick', 'energy', 'bolt', 'speed'] },
  { emoji: '🔌', keywords: ['plug', 'electric', 'power', 'connect', 'charge', 'plugin', 'integration'] },
  { emoji: '🔋', keywords: ['battery', 'power', 'charge', 'energy', 'level'] },
  { emoji: '💡', keywords: ['lightbulb', 'idea', 'inspiration', 'tip', 'suggestion', 'innovation', 'bright'] },

  // ─── Technology & Computing ─────────────────────────────────────────────
  { emoji: '📱', keywords: ['phone', 'mobile', 'app', 'smartphone', 'device', 'ios', 'android'] },
  { emoji: '💻', keywords: ['laptop', 'computer', 'code', 'programming', 'developer', 'web', 'desktop'] },
  { emoji: '🖥️', keywords: ['desktop', 'computer', 'monitor', 'screen', 'display', 'pc'] },
  { emoji: '⌨️', keywords: ['keyboard', 'type', 'input', 'text', 'computer'] },
  { emoji: '🖱️', keywords: ['mouse', 'click', 'cursor', 'computer', 'input'] },
  { emoji: '🖨️', keywords: ['printer', 'print', 'document', 'paper', 'output'] },
  { emoji: '💾', keywords: ['floppy', 'disk', 'save', 'storage', 'backup', 'data'] },
  { emoji: '💿', keywords: ['cd', 'disc', 'media', 'storage', 'music'] },
  { emoji: '📀', keywords: ['dvd', 'disc', 'media', 'video', 'storage'] },
  { emoji: '🧮', keywords: ['abacus', 'calculator', 'math', 'count', 'calculate', 'compute'] },
  { emoji: '📡', keywords: ['satellite', 'signal', 'broadcast', 'antenna', 'network', 'wireless', 'radio'] },
  { emoji: '🔗', keywords: ['link', 'chain', 'url', 'connect', 'connection', 'hyperlink', 'share'] },
  { emoji: '🌐', keywords: ['globe', 'web', 'internet', 'world', 'global', 'network', 'website', 'browser'] },
  { emoji: '📲', keywords: ['phone', 'download', 'mobile', 'notification', 'incoming'] },
  { emoji: '🤖', keywords: ['robot', 'bot', 'ai', 'artificial', 'intelligence', 'automation', 'machine'] },
  { emoji: '🧠', keywords: ['brain', 'smart', 'intelligence', 'ai', 'think', 'cognitive', 'neural', 'ml'] },
  { emoji: '🔑', keywords: ['key', 'password', 'security', 'access', 'auth', 'authentication', 'login', 'unlock'] },
  { emoji: '🔐', keywords: ['lock', 'secure', 'private', 'encrypted', 'password', 'auth'] },
  { emoji: '🔒', keywords: ['lock', 'secure', 'private', 'locked', 'security', 'protected'] },
  { emoji: '🔓', keywords: ['unlock', 'open', 'access', 'public'] },
  { emoji: '🛡️', keywords: ['shield', 'security', 'protect', 'defense', 'guard', 'safety', 'firewall'] },
  { emoji: '🧩', keywords: ['puzzle', 'plugin', 'extension', 'piece', 'integrate', 'module', 'component'] },
  { emoji: '🔮', keywords: ['crystal', 'ball', 'predict', 'forecast', 'future', 'magic', 'ai'] },
  { emoji: '📟', keywords: ['pager', 'device', 'notification', 'alert', 'beeper'] },
  { emoji: '📠', keywords: ['fax', 'machine', 'document', 'send', 'office'] },
  { emoji: '🖲️', keywords: ['trackball', 'input', 'control', 'navigation'] },

  // ─── Documents & Writing ────────────────────────────────────────────────
  { emoji: '📝', keywords: ['note', 'memo', 'write', 'edit', 'pencil', 'document', 'form', 'text', 'draft'] },
  { emoji: '📄', keywords: ['document', 'page', 'file', 'paper', 'text', 'report'] },
  { emoji: '📃', keywords: ['document', 'page', 'curl', 'paper', 'scroll'] },
  { emoji: '📋', keywords: ['clipboard', 'checklist', 'list', 'tasks', 'form', 'copy', 'paste'] },
  { emoji: '📑', keywords: ['tabs', 'bookmark', 'document', 'pages', 'sections'] },
  { emoji: '📂', keywords: ['folder', 'open', 'directory', 'files', 'organize', 'category'] },
  { emoji: '📁', keywords: ['folder', 'directory', 'files', 'organize', 'storage', 'archive'] },
  { emoji: '🗂️', keywords: ['dividers', 'index', 'organize', 'files', 'tabs', 'category', 'sort'] },
  { emoji: '🗃️', keywords: ['box', 'files', 'archive', 'storage', 'database', 'cabinet'] },
  { emoji: '📰', keywords: ['newspaper', 'news', 'article', 'press', 'headline', 'media', 'blog'] },
  { emoji: '📖', keywords: ['book', 'open', 'read', 'study', 'learn', 'manual', 'documentation', 'guide'] },
  { emoji: '📕', keywords: ['book', 'red', 'closed', 'read', 'reference'] },
  { emoji: '📗', keywords: ['book', 'green', 'read', 'reference', 'guide'] },
  { emoji: '📘', keywords: ['book', 'blue', 'read', 'documentation', 'manual'] },
  { emoji: '📙', keywords: ['book', 'orange', 'read', 'reference'] },
  { emoji: '📚', keywords: ['books', 'library', 'study', 'read', 'learn', 'education', 'knowledge', 'documentation'] },
  { emoji: '📓', keywords: ['notebook', 'journal', 'write', 'notes', 'diary'] },
  { emoji: '📒', keywords: ['ledger', 'notebook', 'accounting', 'notes', 'log'] },
  { emoji: '📔', keywords: ['notebook', 'decorative', 'journal', 'diary', 'notes'] },
  { emoji: '🗒️', keywords: ['notepad', 'spiral', 'notes', 'memo', 'pad', 'write'] },
  { emoji: '✏️', keywords: ['pencil', 'write', 'edit', 'draw', 'compose'] },
  { emoji: '✒️', keywords: ['pen', 'nib', 'write', 'ink', 'signature', 'calligraphy'] },
  { emoji: '🖊️', keywords: ['pen', 'write', 'sign', 'ink', 'ballpoint'] },
  { emoji: '🖋️', keywords: ['fountain', 'pen', 'write', 'calligraphy', 'signature'] },
  { emoji: '📮', keywords: ['postbox', 'mail', 'send', 'letter', 'post'] },
  { emoji: '✉️', keywords: ['email', 'mail', 'envelope', 'message', 'letter', 'send', 'inbox'] },
  { emoji: '📧', keywords: ['email', 'mail', 'electronic', 'message', 'inbox', 'send'] },
  { emoji: '📨', keywords: ['envelope', 'incoming', 'mail', 'receive', 'message'] },
  { emoji: '📩', keywords: ['envelope', 'arrow', 'mail', 'receive', 'download'] },
  { emoji: '📬', keywords: ['mailbox', 'mail', 'letter', 'receive', 'inbox'] },
  { emoji: '🏷️', keywords: ['tag', 'label', 'price', 'name', 'category', 'badge'] },
  { emoji: '🔖', keywords: ['bookmark', 'save', 'mark', 'favorite', 'tag'] },

  // ─── Time & Calendar ────────────────────────────────────────────────────
  { emoji: '📅', keywords: ['calendar', 'date', 'schedule', 'event', 'planner', 'day'] },
  { emoji: '🗓️', keywords: ['calendar', 'spiral', 'schedule', 'date', 'planner', 'month'] },
  { emoji: '📆', keywords: ['calendar', 'tearoff', 'date', 'schedule', 'event'] },
  { emoji: '⏰', keywords: ['alarm', 'clock', 'time', 'wake', 'reminder', 'timer'] },
  { emoji: '⏱️', keywords: ['stopwatch', 'timer', 'time', 'track', 'speed', 'countdown', 'duration'] },
  { emoji: '⏲️', keywords: ['timer', 'clock', 'countdown', 'cooking', 'time'] },
  { emoji: '🕐', keywords: ['clock', 'time', 'one', 'hour', 'schedule'] },
  { emoji: '⌛', keywords: ['hourglass', 'time', 'wait', 'loading', 'patience', 'deadline'] },
  { emoji: '⏳', keywords: ['hourglass', 'flowing', 'time', 'countdown', 'progress', 'loading'] },

  // ─── Search & Discovery ─────────────────────────────────────────────────
  { emoji: '🔍', keywords: ['search', 'find', 'look', 'magnify', 'inspect', 'discover', 'explore', 'query'] },
  { emoji: '🔎', keywords: ['search', 'find', 'magnify', 'inspect', 'right', 'discover'] },
  { emoji: '🔭', keywords: ['telescope', 'observe', 'explore', 'discover', 'space', 'astronomy', 'look'] },
  { emoji: '🔬', keywords: ['microscope', 'science', 'research', 'lab', 'inspect', 'detail', 'analyze'] },
  { emoji: '🧭', keywords: ['compass', 'navigate', 'direction', 'explore', 'travel', 'orientation'] },

  // ─── Communication & Social ─────────────────────────────────────────────
  { emoji: '💬', keywords: ['chat', 'message', 'speech', 'bubble', 'talk', 'comment', 'discuss', 'conversation'] },
  { emoji: '💭', keywords: ['thought', 'think', 'bubble', 'idea', 'dream'] },
  { emoji: '🗣️', keywords: ['speaking', 'voice', 'talk', 'announce', 'speech', 'present'] },
  { emoji: '📢', keywords: ['megaphone', 'announce', 'broadcast', 'alert', 'notification', 'loud'] },
  { emoji: '📣', keywords: ['megaphone', 'cheer', 'announce', 'shout', 'campaign'] },
  { emoji: '🔔', keywords: ['bell', 'notification', 'alert', 'reminder', 'ring', 'alarm'] },
  { emoji: '🔕', keywords: ['bell', 'mute', 'silent', 'quiet', 'notification', 'off'] },
  { emoji: '📞', keywords: ['phone', 'call', 'telephone', 'contact', 'dial', 'receiver'] },
  { emoji: '📳', keywords: ['vibration', 'phone', 'mode', 'silent', 'notification'] },
  { emoji: '👥', keywords: ['people', 'group', 'team', 'users', 'community', 'social', 'members'] },
  { emoji: '👤', keywords: ['person', 'user', 'profile', 'account', 'silhouette', 'identity'] },
  { emoji: '👨‍💻', keywords: ['developer', 'coder', 'programmer', 'technologist', 'man', 'computer'] },
  { emoji: '👩‍💻', keywords: ['developer', 'coder', 'programmer', 'technologist', 'woman', 'computer'] },
  { emoji: '👨‍💼', keywords: ['office', 'worker', 'business', 'man', 'professional'] },
  { emoji: '👩‍💼', keywords: ['office', 'worker', 'business', 'woman', 'professional'] },
  { emoji: '👨‍🏫', keywords: ['teacher', 'instructor', 'professor', 'education', 'man'] },
  { emoji: '👩‍🏫', keywords: ['teacher', 'instructor', 'professor', 'education', 'woman'] },
  { emoji: '👨‍🔬', keywords: ['scientist', 'research', 'lab', 'man', 'science'] },
  { emoji: '👩‍🔬', keywords: ['scientist', 'research', 'lab', 'woman', 'science'] },
  { emoji: '👨‍🎨', keywords: ['artist', 'designer', 'creative', 'paint', 'man'] },
  { emoji: '👩‍🎨', keywords: ['artist', 'designer', 'creative', 'paint', 'woman'] },

  // ─── Targets & Goals ────────────────────────────────────────────────────
  { emoji: '🎯', keywords: ['target', 'goal', 'bullseye', 'aim', 'focus', 'objective', 'hit', 'accuracy'] },
  { emoji: '🏆', keywords: ['trophy', 'winner', 'champion', 'award', 'achievement', 'competition', 'first'] },
  { emoji: '🥇', keywords: ['gold', 'medal', 'first', 'winner', 'best', 'achievement'] },
  { emoji: '🥈', keywords: ['silver', 'medal', 'second', 'runner', 'achievement'] },
  { emoji: '🥉', keywords: ['bronze', 'medal', 'third', 'achievement'] },
  { emoji: '🏅', keywords: ['medal', 'award', 'sports', 'achievement', 'honor'] },
  { emoji: '⭐', keywords: ['star', 'favorite', 'rating', 'important', 'featured', 'review'] },
  { emoji: '🌟', keywords: ['star', 'glowing', 'sparkle', 'shine', 'highlight', 'featured'] },
  { emoji: '✨', keywords: ['sparkle', 'new', 'clean', 'magic', 'special', 'shine'] },
  { emoji: '🎖️', keywords: ['medal', 'military', 'honor', 'award', 'badge'] },
  { emoji: '🏁', keywords: ['checkered', 'flag', 'finish', 'race', 'complete', 'done'] },
  { emoji: '🚩', keywords: ['flag', 'mark', 'report', 'alert', 'milestone', 'warning'] },
  { emoji: '📌', keywords: ['pin', 'location', 'mark', 'important', 'pinned', 'bookmark'] },
  { emoji: '📍', keywords: ['pin', 'location', 'map', 'place', 'position'] },

  // ─── Science & Math ─────────────────────────────────────────────────────
  { emoji: '🧪', keywords: ['test', 'tube', 'lab', 'science', 'experiment', 'chemistry', 'research'] },
  { emoji: '⚗️', keywords: ['alembic', 'chemistry', 'lab', 'experiment', 'science', 'distill'] },
  { emoji: '🧬', keywords: ['dna', 'genetics', 'biology', 'science', 'gene', 'helix'] },
  { emoji: '🦠', keywords: ['microbe', 'bacteria', 'virus', 'germ', 'biology', 'health'] },
  { emoji: '⚛️', keywords: ['atom', 'science', 'physics', 'nuclear', 'react', 'molecule'] },
  { emoji: '🧫', keywords: ['petri', 'dish', 'lab', 'biology', 'culture', 'science'] },
  { emoji: '🔢', keywords: ['numbers', 'math', 'count', 'input', 'numeric', 'digit', 'calculate'] },
  { emoji: '🔣', keywords: ['symbols', 'input', 'characters', 'signs', 'math'] },
  { emoji: '➕', keywords: ['plus', 'add', 'increase', 'positive', 'math', 'new'] },
  { emoji: '➖', keywords: ['minus', 'subtract', 'decrease', 'remove', 'math'] },
  { emoji: '➗', keywords: ['divide', 'division', 'split', 'math', 'calculate'] },
  { emoji: '✖️', keywords: ['multiply', 'times', 'math', 'calculate', 'cross'] },
  { emoji: '♾️', keywords: ['infinity', 'forever', 'unlimited', 'endless', 'math'] },
  { emoji: '📐', keywords: ['ruler', 'triangle', 'angle', 'measure', 'geometry', 'math', 'drawing'] },
  { emoji: '📏', keywords: ['ruler', 'straight', 'measure', 'length', 'size', 'dimension'] },

  // ─── Package & Shipping ─────────────────────────────────────────────────
  { emoji: '📦', keywords: ['package', 'box', 'delivery', 'ship', 'deploy', 'product', 'cargo', 'inventory'] },
  { emoji: '📫', keywords: ['mailbox', 'post', 'letter', 'deliver', 'mail'] },
  { emoji: '📪', keywords: ['mailbox', 'empty', 'no', 'mail'] },
  { emoji: '🗳️', keywords: ['ballot', 'box', 'vote', 'poll', 'election', 'survey'] },
  { emoji: '🎁', keywords: ['gift', 'present', 'reward', 'surprise', 'bonus', 'offer', 'prize'] },

  // ─── Navigation & Transport ─────────────────────────────────────────────
  { emoji: '🚀', keywords: ['rocket', 'launch', 'deploy', 'fast', 'startup', 'speed', 'boost', 'ship'] },
  { emoji: '✈️', keywords: ['airplane', 'flight', 'travel', 'air', 'trip', 'transport'] },
  { emoji: '🚗', keywords: ['car', 'auto', 'drive', 'vehicle', 'transport', 'road'] },
  { emoji: '🚕', keywords: ['taxi', 'cab', 'ride', 'transport', 'fare'] },
  { emoji: '🚌', keywords: ['bus', 'transit', 'transport', 'public', 'route'] },
  { emoji: '🚂', keywords: ['train', 'locomotive', 'railway', 'transport', 'travel'] },
  { emoji: '🚢', keywords: ['ship', 'boat', 'cruise', 'transport', 'sea', 'maritime'] },
  { emoji: '🛸', keywords: ['ufo', 'alien', 'space', 'flying', 'saucer', 'sci-fi'] },
  { emoji: '🗺️', keywords: ['map', 'world', 'globe', 'travel', 'geography', 'location', 'navigate'] },
  { emoji: '🧭', keywords: ['compass', 'navigate', 'direction', 'explore', 'orientation'] },
  { emoji: '🏠', keywords: ['house', 'home', 'residence', 'property', 'real estate', 'building'] },
  { emoji: '🏡', keywords: ['house', 'garden', 'home', 'property', 'residential'] },
  { emoji: '🏘️', keywords: ['houses', 'neighborhood', 'community', 'residential', 'suburb'] },
  { emoji: '🏥', keywords: ['hospital', 'medical', 'health', 'clinic', 'doctor'] },
  { emoji: '🏫', keywords: ['school', 'education', 'building', 'learn', 'class'] },
  { emoji: '🏛️', keywords: ['building', 'classical', 'government', 'museum', 'institution'] },
  { emoji: '⛪', keywords: ['church', 'religion', 'building', 'worship'] },
  { emoji: '🏭', keywords: ['factory', 'manufacturing', 'industry', 'production', 'industrial'] },

  // ─── Nature & Weather ───────────────────────────────────────────────────
  { emoji: '🌊', keywords: ['wave', 'ocean', 'water', 'sea', 'surf', 'flow', 'stream'] },
  { emoji: '🌍', keywords: ['earth', 'globe', 'world', 'planet', 'global', 'environment'] },
  { emoji: '🌎', keywords: ['earth', 'americas', 'globe', 'world', 'planet'] },
  { emoji: '🌏', keywords: ['earth', 'asia', 'globe', 'world', 'planet'] },
  { emoji: '☀️', keywords: ['sun', 'sunny', 'weather', 'bright', 'light', 'day', 'solar'] },
  { emoji: '🌤️', keywords: ['sun', 'cloud', 'weather', 'partly', 'cloudy'] },
  { emoji: '⛅', keywords: ['cloud', 'sun', 'weather', 'partly', 'cloudy'] },
  { emoji: '🌧️', keywords: ['rain', 'weather', 'cloud', 'water', 'storm'] },
  { emoji: '⛈️', keywords: ['storm', 'thunder', 'lightning', 'weather', 'rain'] },
  { emoji: '🌈', keywords: ['rainbow', 'color', 'spectrum', 'pride', 'diversity', 'colorful'] },
  { emoji: '❄️', keywords: ['snowflake', 'cold', 'winter', 'ice', 'frozen', 'cool'] },
  { emoji: '🔥', keywords: ['fire', 'hot', 'flame', 'trending', 'popular', 'lit', 'burn'] },
  { emoji: '🌱', keywords: ['seedling', 'plant', 'grow', 'new', 'start', 'green', 'eco', 'sustainability'] },
  { emoji: '🌿', keywords: ['herb', 'plant', 'leaf', 'green', 'nature', 'organic'] },
  { emoji: '🍀', keywords: ['clover', 'luck', 'lucky', 'four', 'leaf', 'fortune'] },
  { emoji: '🌲', keywords: ['tree', 'evergreen', 'pine', 'forest', 'nature', 'wood'] },
  { emoji: '🌳', keywords: ['tree', 'deciduous', 'nature', 'forest', 'oak'] },
  { emoji: '🌴', keywords: ['palm', 'tree', 'tropical', 'beach', 'vacation', 'island'] },
  { emoji: '🌵', keywords: ['cactus', 'desert', 'plant', 'dry', 'hot'] },
  { emoji: '🌺', keywords: ['flower', 'hibiscus', 'tropical', 'bloom', 'nature'] },
  { emoji: '🌻', keywords: ['sunflower', 'flower', 'sun', 'bright', 'happy'] },
  { emoji: '🌸', keywords: ['cherry', 'blossom', 'flower', 'spring', 'pink'] },
  { emoji: '💐', keywords: ['bouquet', 'flowers', 'gift', 'beauty', 'arrangement'] },
  { emoji: '🍄', keywords: ['mushroom', 'fungus', 'nature', 'forest'] },
  { emoji: '🌋', keywords: ['volcano', 'eruption', 'lava', 'mountain', 'hot'] },
  { emoji: '⛰️', keywords: ['mountain', 'peak', 'climb', 'terrain', 'landscape'] },
  { emoji: '🏔️', keywords: ['mountain', 'snow', 'peak', 'alps', 'high'] },

  // ─── Food & Drink ───────────────────────────────────────────────────────
  { emoji: '☕', keywords: ['coffee', 'drink', 'cafe', 'hot', 'beverage', 'morning', 'break'] },
  { emoji: '🍵', keywords: ['tea', 'drink', 'green', 'hot', 'beverage', 'cup'] },
  { emoji: '🧃', keywords: ['juice', 'box', 'drink', 'beverage', 'fruit'] },
  { emoji: '🥤', keywords: ['cup', 'straw', 'drink', 'soda', 'beverage'] },
  { emoji: '🍺', keywords: ['beer', 'drink', 'alcohol', 'pub', 'bar', 'mug'] },
  { emoji: '🍷', keywords: ['wine', 'drink', 'glass', 'alcohol', 'red'] },
  { emoji: '🍔', keywords: ['burger', 'hamburger', 'food', 'fast', 'restaurant', 'meal'] },
  { emoji: '🍕', keywords: ['pizza', 'food', 'slice', 'italian', 'fast'] },
  { emoji: '🍰', keywords: ['cake', 'dessert', 'sweet', 'birthday', 'celebration'] },
  { emoji: '🧁', keywords: ['cupcake', 'dessert', 'sweet', 'bake', 'treat'] },
  { emoji: '🍳', keywords: ['egg', 'cooking', 'frying', 'breakfast', 'pan', 'recipe'] },
  { emoji: '🥗', keywords: ['salad', 'food', 'healthy', 'green', 'nutrition', 'diet'] },
  { emoji: '🍎', keywords: ['apple', 'red', 'fruit', 'healthy', 'food', 'nutrition'] },
  { emoji: '🍊', keywords: ['orange', 'fruit', 'citrus', 'food', 'juice'] },
  { emoji: '🍋', keywords: ['lemon', 'fruit', 'citrus', 'sour', 'yellow'] },
  { emoji: '🍉', keywords: ['watermelon', 'fruit', 'summer', 'food', 'red'] },
  { emoji: '🥑', keywords: ['avocado', 'fruit', 'food', 'healthy', 'green'] },
  { emoji: '🌶️', keywords: ['pepper', 'hot', 'spicy', 'chili', 'food'] },
  { emoji: '🍩', keywords: ['donut', 'doughnut', 'dessert', 'sweet', 'snack'] },
  { emoji: '🍪', keywords: ['cookie', 'sweet', 'snack', 'bake', 'treat'] },

  // ─── Health & Fitness ───────────────────────────────────────────────────
  { emoji: '❤️', keywords: ['heart', 'love', 'health', 'favorite', 'like', 'care', 'red'] },
  { emoji: '💚', keywords: ['heart', 'green', 'love', 'eco', 'health', 'nature'] },
  { emoji: '💙', keywords: ['heart', 'blue', 'love', 'trust', 'calm'] },
  { emoji: '💜', keywords: ['heart', 'purple', 'love', 'creative'] },
  { emoji: '🧡', keywords: ['heart', 'orange', 'love', 'warm'] },
  { emoji: '💛', keywords: ['heart', 'yellow', 'love', 'bright', 'happy'] },
  { emoji: '🩺', keywords: ['stethoscope', 'doctor', 'medical', 'health', 'checkup', 'diagnosis'] },
  { emoji: '💊', keywords: ['pill', 'medicine', 'drug', 'health', 'pharmacy', 'medication'] },
  { emoji: '🩹', keywords: ['bandage', 'adhesive', 'heal', 'medical', 'wound', 'fix'] },
  { emoji: '🏃', keywords: ['run', 'exercise', 'fitness', 'sport', 'jog', 'running'] },
  { emoji: '🏋️', keywords: ['weightlifting', 'gym', 'fitness', 'exercise', 'strong', 'workout'] },
  { emoji: '🧘', keywords: ['yoga', 'meditation', 'relax', 'zen', 'mindfulness', 'wellness'] },
  { emoji: '🚴', keywords: ['cycling', 'bike', 'bicycle', 'exercise', 'fitness', 'sport'] },
  { emoji: '🏊', keywords: ['swimming', 'swim', 'pool', 'water', 'exercise', 'fitness'] },
  { emoji: '🧗', keywords: ['climbing', 'climb', 'rock', 'adventure', 'sport'] },
  { emoji: '🤸', keywords: ['gymnastics', 'cartwheel', 'flexible', 'fitness'] },
  { emoji: '🏌️', keywords: ['golf', 'sport', 'club', 'tee'] },

  // ─── Sports & Games ─────────────────────────────────────────────────────
  { emoji: '⚽', keywords: ['soccer', 'football', 'ball', 'sport', 'game'] },
  { emoji: '🏀', keywords: ['basketball', 'sport', 'ball', 'game', 'hoop'] },
  { emoji: '🏈', keywords: ['football', 'american', 'sport', 'ball', 'game'] },
  { emoji: '⚾', keywords: ['baseball', 'sport', 'ball', 'game'] },
  { emoji: '🎾', keywords: ['tennis', 'sport', 'ball', 'game', 'racket'] },
  { emoji: '🏐', keywords: ['volleyball', 'sport', 'ball', 'game'] },
  { emoji: '🎮', keywords: ['game', 'controller', 'gaming', 'play', 'video', 'console'] },
  { emoji: '🕹️', keywords: ['joystick', 'game', 'arcade', 'retro', 'play', 'gaming'] },
  { emoji: '🎲', keywords: ['dice', 'game', 'random', 'chance', 'luck', 'gambling', 'roll'] },
  { emoji: '♟️', keywords: ['chess', 'pawn', 'strategy', 'game', 'board'] },
  { emoji: '🃏', keywords: ['joker', 'card', 'game', 'wild', 'play'] },
  { emoji: '🀄', keywords: ['mahjong', 'game', 'tile', 'play'] },
  { emoji: '🎰', keywords: ['slot', 'machine', 'gamble', 'casino', 'luck'] },
  { emoji: '🎳', keywords: ['bowling', 'sport', 'game', 'pin', 'strike'] },
  { emoji: '🏓', keywords: ['ping', 'pong', 'table', 'tennis', 'game'] },

  // ─── Music & Media ──────────────────────────────────────────────────────
  { emoji: '🎵', keywords: ['music', 'note', 'sound', 'audio', 'song', 'melody'] },
  { emoji: '🎶', keywords: ['music', 'notes', 'sound', 'audio', 'song', 'melody'] },
  { emoji: '🎧', keywords: ['headphones', 'music', 'audio', 'listen', 'podcast', 'sound'] },
  { emoji: '🎤', keywords: ['microphone', 'sing', 'record', 'voice', 'karaoke', 'audio', 'podcast'] },
  { emoji: '🎬', keywords: ['movie', 'film', 'video', 'cinema', 'action', 'record', 'scene'] },
  { emoji: '📹', keywords: ['video', 'camera', 'record', 'film', 'camcorder'] },
  { emoji: '📷', keywords: ['camera', 'photo', 'picture', 'image', 'photography', 'snapshot'] },
  { emoji: '📸', keywords: ['camera', 'flash', 'photo', 'picture', 'selfie'] },
  { emoji: '🖼️', keywords: ['frame', 'picture', 'image', 'gallery', 'art', 'photo', 'painting'] },
  { emoji: '🎨', keywords: ['art', 'palette', 'paint', 'design', 'creative', 'color', 'draw'] },
  { emoji: '🎭', keywords: ['theater', 'performing', 'drama', 'comedy', 'arts', 'mask'] },
  { emoji: '🎪', keywords: ['circus', 'tent', 'event', 'show', 'carnival'] },
  { emoji: '📺', keywords: ['television', 'tv', 'screen', 'monitor', 'watch', 'stream', 'video'] },
  { emoji: '📻', keywords: ['radio', 'music', 'broadcast', 'audio', 'stream'] },
  { emoji: '🎸', keywords: ['guitar', 'music', 'rock', 'instrument', 'play'] },
  { emoji: '🎹', keywords: ['piano', 'keyboard', 'music', 'instrument', 'play'] },
  { emoji: '🎺', keywords: ['trumpet', 'music', 'brass', 'instrument', 'jazz'] },
  { emoji: '🥁', keywords: ['drum', 'music', 'beat', 'instrument', 'rhythm'] },
  { emoji: '🎻', keywords: ['violin', 'music', 'string', 'instrument', 'classical'] },

  // ─── Celebration & Fun ──────────────────────────────────────────────────
  { emoji: '🎉', keywords: ['party', 'celebration', 'congratulations', 'confetti', 'tada', 'success'] },
  { emoji: '🎊', keywords: ['confetti', 'celebration', 'party', 'ball', 'festive'] },
  { emoji: '🎈', keywords: ['balloon', 'party', 'birthday', 'celebration', 'fun'] },
  { emoji: '🎂', keywords: ['cake', 'birthday', 'celebration', 'candles', 'party'] },
  { emoji: '🎃', keywords: ['pumpkin', 'halloween', 'jack', 'lantern', 'autumn'] },
  { emoji: '🎄', keywords: ['christmas', 'tree', 'holiday', 'winter', 'decoration'] },
  { emoji: '🎆', keywords: ['fireworks', 'celebration', 'new year', 'night', 'sparkle'] },
  { emoji: '🎇', keywords: ['sparkler', 'fireworks', 'celebration', 'night'] },
  { emoji: '🧨', keywords: ['firecracker', 'explosive', 'celebration', 'bang'] },
  { emoji: '🪅', keywords: ['pinata', 'party', 'celebration', 'candy'] },

  // ─── Arrows & Directions ────────────────────────────────────────────────
  { emoji: '⬆️', keywords: ['up', 'arrow', 'increase', 'direction', 'north'] },
  { emoji: '⬇️', keywords: ['down', 'arrow', 'decrease', 'direction', 'south'] },
  { emoji: '➡️', keywords: ['right', 'arrow', 'next', 'forward', 'direction'] },
  { emoji: '⬅️', keywords: ['left', 'arrow', 'back', 'previous', 'direction'] },
  { emoji: '↩️', keywords: ['return', 'back', 'undo', 'arrow', 'reply'] },
  { emoji: '↪️', keywords: ['forward', 'redo', 'arrow', 'right'] },
  { emoji: '🔄', keywords: ['refresh', 'reload', 'sync', 'rotate', 'cycle', 'update', 'repeat', 'convert'] },
  { emoji: '🔃', keywords: ['clockwise', 'refresh', 'reload', 'arrows', 'rotate'] },
  { emoji: '🔀', keywords: ['shuffle', 'random', 'twisted', 'arrows', 'mix'] },
  { emoji: '🔁', keywords: ['repeat', 'loop', 'cycle', 'replay', 'again'] },

  // ─── Symbols & Status ───────────────────────────────────────────────────
  { emoji: '✅', keywords: ['check', 'done', 'complete', 'yes', 'correct', 'approved', 'verified'] },
  { emoji: '❌', keywords: ['cross', 'no', 'error', 'wrong', 'delete', 'cancel', 'reject'] },
  { emoji: '⚠️', keywords: ['warning', 'alert', 'caution', 'danger', 'attention'] },
  { emoji: '🚫', keywords: ['prohibited', 'forbidden', 'blocked', 'no', 'ban', 'stop'] },
  { emoji: '⛔', keywords: ['stop', 'entry', 'no', 'forbidden', 'blocked'] },
  { emoji: '❓', keywords: ['question', 'help', 'faq', 'ask', 'unknown', 'inquiry'] },
  { emoji: '❗', keywords: ['exclamation', 'important', 'alert', 'warning', 'attention'] },
  { emoji: '💯', keywords: ['hundred', 'perfect', 'score', 'full', 'complete', 'exam'] },
  { emoji: '🆕', keywords: ['new', 'fresh', 'recent', 'latest', 'added'] },
  { emoji: '🆓', keywords: ['free', 'gratis', 'no cost', 'complimentary'] },
  { emoji: '🔴', keywords: ['red', 'circle', 'stop', 'record', 'dot', 'status'] },
  { emoji: '🟢', keywords: ['green', 'circle', 'go', 'active', 'online', 'status'] },
  { emoji: '🔵', keywords: ['blue', 'circle', 'dot', 'status'] },
  { emoji: '🟡', keywords: ['yellow', 'circle', 'warning', 'pending', 'status'] },
  { emoji: '🟠', keywords: ['orange', 'circle', 'dot', 'status'] },
  { emoji: '🟣', keywords: ['purple', 'circle', 'dot', 'status'] },
  { emoji: '⬛', keywords: ['black', 'square', 'block', 'dark'] },
  { emoji: '⬜', keywords: ['white', 'square', 'block', 'light', 'blank'] },
  { emoji: 'ℹ️', keywords: ['info', 'information', 'help', 'about', 'details'] },
  { emoji: '🏴', keywords: ['flag', 'black', 'pirate', 'dark'] },

  // ─── Hands & Gestures ───────────────────────────────────────────────────
  { emoji: '👍', keywords: ['thumbs', 'up', 'approve', 'like', 'good', 'yes'] },
  { emoji: '👎', keywords: ['thumbs', 'down', 'dislike', 'bad', 'no'] },
  { emoji: '👋', keywords: ['wave', 'hello', 'goodbye', 'hi', 'greet'] },
  { emoji: '✋', keywords: ['hand', 'stop', 'raise', 'high five'] },
  { emoji: '👆', keywords: ['point', 'up', 'finger', 'above', 'tap'] },
  { emoji: '👇', keywords: ['point', 'down', 'finger', 'below'] },
  { emoji: '👈', keywords: ['point', 'left', 'finger', 'back'] },
  { emoji: '👉', keywords: ['point', 'right', 'finger', 'next'] },
  { emoji: '🤞', keywords: ['crossed', 'fingers', 'luck', 'hope', 'wish'] },
  { emoji: '🤙', keywords: ['call', 'me', 'shaka', 'hang', 'loose'] },
  { emoji: '💪', keywords: ['muscle', 'strong', 'power', 'flex', 'strength', 'fitness'] },

  // ─── Animals ────────────────────────────────────────────────────────────
  { emoji: '🐶', keywords: ['dog', 'puppy', 'pet', 'animal', 'woof'] },
  { emoji: '🐱', keywords: ['cat', 'kitten', 'pet', 'animal', 'meow'] },
  { emoji: '🐻', keywords: ['bear', 'animal', 'teddy', 'grizzly'] },
  { emoji: '🦊', keywords: ['fox', 'animal', 'clever', 'cunning', 'red'] },
  { emoji: '🦁', keywords: ['lion', 'animal', 'king', 'brave', 'strong'] },
  { emoji: '🐝', keywords: ['bee', 'honey', 'insect', 'buzz', 'busy'] },
  { emoji: '🦋', keywords: ['butterfly', 'insect', 'beautiful', 'nature', 'transform'] },
  { emoji: '🐢', keywords: ['turtle', 'slow', 'animal', 'shell', 'tortoise'] },
  { emoji: '🐬', keywords: ['dolphin', 'ocean', 'sea', 'smart', 'animal'] },
  { emoji: '🦅', keywords: ['eagle', 'bird', 'fly', 'soar', 'freedom'] },
  { emoji: '🐦', keywords: ['bird', 'tweet', 'fly', 'animal', 'twitter'] },
  { emoji: '🦉', keywords: ['owl', 'bird', 'wise', 'night', 'wisdom'] },
  { emoji: '🐙', keywords: ['octopus', 'tentacle', 'sea', 'ocean', 'eight'] },
  { emoji: '🐍', keywords: ['snake', 'python', 'reptile', 'animal'] },
  { emoji: '🦈', keywords: ['shark', 'fish', 'ocean', 'predator', 'sea'] },
  { emoji: '🐺', keywords: ['wolf', 'animal', 'howl', 'wild'] },
  { emoji: '🦄', keywords: ['unicorn', 'fantasy', 'magic', 'mythical', 'rainbow', 'startup'] },
  { emoji: '🐲', keywords: ['dragon', 'fantasy', 'mythical', 'fire', 'power'] },
  { emoji: '🦖', keywords: ['dinosaur', 'trex', 'prehistoric', 'extinct'] },
  { emoji: '🐸', keywords: ['frog', 'toad', 'animal', 'meme', 'leap'] },
  { emoji: '🐒', keywords: ['monkey', 'ape', 'primate', 'animal'] },
  { emoji: '🐛', keywords: ['bug', 'insect', 'caterpillar', 'debug', 'error'] },
  { emoji: '🕷️', keywords: ['spider', 'web', 'insect', 'crawl', 'bug'] },
  { emoji: '🐾', keywords: ['paw', 'prints', 'pet', 'animal', 'track'] },
  { emoji: '🦜', keywords: ['parrot', 'bird', 'colorful', 'talk', 'tropical'] },

  // ─── Faces & Expressions ────────────────────────────────────────────────
  { emoji: '😀', keywords: ['smile', 'happy', 'face', 'grinning', 'joy'] },
  { emoji: '😎', keywords: ['cool', 'sunglasses', 'awesome', 'confident'] },
  { emoji: '🤔', keywords: ['think', 'hmm', 'question', 'wondering', 'ponder'] },
  { emoji: '😱', keywords: ['scream', 'shock', 'horror', 'surprise', 'fear'] },
  { emoji: '🤯', keywords: ['mind', 'blown', 'exploding', 'amazed', 'shocked'] },
  { emoji: '😴', keywords: ['sleep', 'tired', 'rest', 'zzz', 'nap'] },
  { emoji: '🥳', keywords: ['party', 'celebration', 'birthday', 'happy', 'fun'] },
  { emoji: '😈', keywords: ['devil', 'evil', 'mischief', 'smile', 'horns'] },
  { emoji: '👻', keywords: ['ghost', 'halloween', 'spooky', 'boo', 'spirit'] },
  { emoji: '💀', keywords: ['skull', 'dead', 'death', 'skeleton', 'danger'] },
  { emoji: '🤓', keywords: ['nerd', 'geek', 'smart', 'glasses', 'study'] },
  { emoji: '🧐', keywords: ['monocle', 'inspect', 'examine', 'curious', 'fancy'] },

  // ─── Clothing & Objects ─────────────────────────────────────────────────
  { emoji: '👑', keywords: ['crown', 'king', 'queen', 'royal', 'premium', 'vip', 'best'] },
  { emoji: '💍', keywords: ['ring', 'diamond', 'wedding', 'engagement', 'jewelry'] },
  { emoji: '👓', keywords: ['glasses', 'eyeglasses', 'see', 'read', 'vision', 'spectacles'] },
  { emoji: '🕶️', keywords: ['sunglasses', 'cool', 'shades', 'dark', 'sun'] },
  { emoji: '🎒', keywords: ['backpack', 'school', 'bag', 'travel', 'carry'] },
  { emoji: '👔', keywords: ['necktie', 'business', 'formal', 'professional', 'suit'] },
  { emoji: '👕', keywords: ['shirt', 'tshirt', 'clothing', 'casual'] },
  { emoji: '🎩', keywords: ['hat', 'top', 'magic', 'gentleman', 'formal'] },
  { emoji: '⛑️', keywords: ['helmet', 'rescue', 'safety', 'emergency', 'cross'] },
  { emoji: '🧢', keywords: ['cap', 'hat', 'baseball', 'casual', 'sport'] },

  // ─── Household & Living ─────────────────────────────────────────────────
  { emoji: '🛏️', keywords: ['bed', 'sleep', 'bedroom', 'rest', 'hotel'] },
  { emoji: '🛋️', keywords: ['couch', 'sofa', 'furniture', 'relax', 'living', 'room'] },
  { emoji: '🪑', keywords: ['chair', 'seat', 'sit', 'furniture'] },
  { emoji: '🚿', keywords: ['shower', 'water', 'bathroom', 'clean', 'wash'] },
  { emoji: '🛁', keywords: ['bathtub', 'bath', 'clean', 'relax', 'bathroom'] },
  { emoji: '🚽', keywords: ['toilet', 'bathroom', 'restroom', 'plumbing'] },
  { emoji: '🪞', keywords: ['mirror', 'reflection', 'look', 'vanity'] },
  { emoji: '🧹', keywords: ['broom', 'clean', 'sweep', 'tidy', 'housekeeping'] },
  { emoji: '🧺', keywords: ['basket', 'laundry', 'storage', 'carry', 'organize'] },
  { emoji: '🔑', keywords: ['key', 'lock', 'access', 'password', 'security', 'auth'] },
  { emoji: '🪣', keywords: ['bucket', 'pail', 'water', 'container', 's3'] },
  { emoji: '🧴', keywords: ['lotion', 'bottle', 'skincare', 'cream', 'product'] },

  // ─── Vehicles & Machines ────────────────────────────────────────────────
  { emoji: '🚜', keywords: ['tractor', 'farm', 'agriculture', 'vehicle'] },
  { emoji: '🚑', keywords: ['ambulance', 'emergency', 'medical', 'hospital', 'health'] },
  { emoji: '🚒', keywords: ['fire', 'truck', 'engine', 'emergency', 'rescue'] },
  { emoji: '🚓', keywords: ['police', 'car', 'law', 'enforcement', 'emergency'] },
  { emoji: '🚲', keywords: ['bicycle', 'bike', 'cycle', 'ride', 'transport', 'pedal'] },
  { emoji: '🛵', keywords: ['scooter', 'motor', 'ride', 'vehicle'] },
  { emoji: '🏍️', keywords: ['motorcycle', 'racing', 'bike', 'speed', 'ride'] },
  { emoji: '🛶', keywords: ['canoe', 'boat', 'paddle', 'water', 'kayak'] },
  { emoji: '⛵', keywords: ['sailboat', 'boat', 'sail', 'wind', 'ocean'] },
  { emoji: '🚁', keywords: ['helicopter', 'fly', 'aerial', 'transport', 'chopper'] },
  { emoji: '🛩️', keywords: ['airplane', 'small', 'plane', 'fly', 'aviation'] },
  { emoji: '🚀', keywords: ['rocket', 'launch', 'space', 'ship', 'fast'] },

  // ─── UI & Interface ─────────────────────────────────────────────────────
  { emoji: '🔲', keywords: ['button', 'black', 'square', 'input', 'checkbox'] },
  { emoji: '🔳', keywords: ['button', 'white', 'square', 'outline'] },
  { emoji: '▶️', keywords: ['play', 'start', 'begin', 'forward', 'video', 'media'] },
  { emoji: '⏸️', keywords: ['pause', 'stop', 'wait', 'media'] },
  { emoji: '⏹️', keywords: ['stop', 'halt', 'end', 'media'] },
  { emoji: '⏭️', keywords: ['next', 'skip', 'forward', 'track'] },
  { emoji: '⏮️', keywords: ['previous', 'back', 'rewind', 'track'] },
  { emoji: '🔊', keywords: ['volume', 'loud', 'sound', 'speaker', 'audio'] },
  { emoji: '🔉', keywords: ['volume', 'sound', 'speaker', 'audio', 'medium'] },
  { emoji: '🔈', keywords: ['volume', 'low', 'sound', 'speaker', 'audio'] },
  { emoji: '🔇', keywords: ['mute', 'silent', 'sound', 'off', 'quiet'] },

  // ─── Misc & Abstract ────────────────────────────────────────────────────
  { emoji: '🎪', keywords: ['circus', 'tent', 'event', 'show', 'carnival'] },
  { emoji: '🎡', keywords: ['ferris', 'wheel', 'amusement', 'park', 'ride'] },
  { emoji: '🎢', keywords: ['roller', 'coaster', 'amusement', 'park', 'ride', 'thrill'] },
  { emoji: '🎠', keywords: ['carousel', 'horse', 'merry', 'go', 'round'] },
  { emoji: '🧿', keywords: ['evil', 'eye', 'protection', 'nazar', 'amulet'] },
  { emoji: '🪬', keywords: ['hamsa', 'hand', 'protection', 'luck'] },
  { emoji: '♻️', keywords: ['recycle', 'green', 'environment', 'eco', 'reuse', 'sustainable'] },
  { emoji: '🔰', keywords: ['beginner', 'japanese', 'symbol', 'start', 'new'] },
  { emoji: '💠', keywords: ['diamond', 'dot', 'inside', 'blue', 'shape'] },
  { emoji: '🔱', keywords: ['trident', 'emblem', 'poseidon', 'spear', 'weapon'] },
  { emoji: '⚜️', keywords: ['fleur', 'de', 'lis', 'scout', 'emblem'] },
  { emoji: '🏵️', keywords: ['rosette', 'flower', 'award', 'decoration'] },
  { emoji: '🎗️', keywords: ['ribbon', 'awareness', 'reminder', 'cause'] },
  { emoji: '🎟️', keywords: ['ticket', 'admission', 'event', 'entry', 'coupon'] },
  { emoji: '🎫', keywords: ['ticket', 'event', 'admission', 'pass', 'stub'] },
  { emoji: '🪄', keywords: ['wand', 'magic', 'wizard', 'spell', 'trick'] },
  { emoji: '🔮', keywords: ['crystal', 'ball', 'fortune', 'predict', 'magic'] },
  { emoji: '🕯️', keywords: ['candle', 'light', 'flame', 'warm', 'cozy'] },
  { emoji: '🧊', keywords: ['ice', 'cube', 'cold', 'freeze', 'frozen', 'cool'] },
  { emoji: '🫧', keywords: ['bubble', 'soap', 'clean', 'float', 'wash'] },
  { emoji: '💫', keywords: ['dizzy', 'star', 'sparkle', 'magic', 'cosmic'] },
  { emoji: '🌀', keywords: ['cyclone', 'spiral', 'spin', 'dizzy', 'loading'] },
  { emoji: '🕸️', keywords: ['web', 'spider', 'cobweb', 'network', 'internet'] },
  { emoji: '🧶', keywords: ['yarn', 'knit', 'craft', 'thread', 'textile'] },
  { emoji: '🧵', keywords: ['thread', 'sew', 'needle', 'string', 'stitch'] },
  { emoji: '🪡', keywords: ['needle', 'sew', 'stitch', 'pin', 'craft'] },

  // ─── Flags & Geography ──────────────────────────────────────────────────
  { emoji: '🏳️', keywords: ['flag', 'white', 'surrender', 'peace'] },
  { emoji: '🏴‍☠️', keywords: ['pirate', 'flag', 'skull', 'crossbones', 'jolly', 'roger'] },
  { emoji: '🇦🇺', keywords: ['australia', 'flag', 'country', 'aussie'] },
  { emoji: '🇬🇧', keywords: ['uk', 'britain', 'flag', 'country', 'british', 'england'] },
  { emoji: '🇺🇸', keywords: ['usa', 'america', 'flag', 'country', 'states'] },
  { emoji: '🇯🇵', keywords: ['japan', 'flag', 'country', 'japanese'] },
  { emoji: '🇩🇪', keywords: ['germany', 'flag', 'country', 'german'] },
  { emoji: '🇫🇷', keywords: ['france', 'flag', 'country', 'french'] },
  { emoji: '🇳🇿', keywords: ['new zealand', 'flag', 'country', 'kiwi', 'nz'] },
  { emoji: '🇨🇦', keywords: ['canada', 'flag', 'country', 'canadian', 'maple'] },

  // ─── Zodiac & Astrology ─────────────────────────────────────────────────
  { emoji: '♈', keywords: ['aries', 'zodiac', 'sign', 'astrology'] },
  { emoji: '♉', keywords: ['taurus', 'zodiac', 'sign', 'astrology'] },
  { emoji: '♊', keywords: ['gemini', 'zodiac', 'sign', 'astrology'] },
  { emoji: '♋', keywords: ['cancer', 'zodiac', 'sign', 'astrology'] },
  { emoji: '♌', keywords: ['leo', 'zodiac', 'sign', 'astrology'] },
  { emoji: '♍', keywords: ['virgo', 'zodiac', 'sign', 'astrology'] },
  { emoji: '♎', keywords: ['libra', 'zodiac', 'sign', 'astrology', 'balance', 'scale'] },
  { emoji: '♏', keywords: ['scorpio', 'zodiac', 'sign', 'astrology'] },
  { emoji: '♐', keywords: ['sagittarius', 'zodiac', 'sign', 'astrology'] },
  { emoji: '♑', keywords: ['capricorn', 'zodiac', 'sign', 'astrology'] },
  { emoji: '♒', keywords: ['aquarius', 'zodiac', 'sign', 'astrology'] },
  { emoji: '♓', keywords: ['pisces', 'zodiac', 'sign', 'astrology'] },

  // ─── Extra useful for apps ──────────────────────────────────────────────
  { emoji: '📊', keywords: ['analytics', 'report', 'dashboard', 'metrics', 'kpi'] },
  { emoji: '🗄️', keywords: ['cabinet', 'server', 'database', 'storage', 'archive', 'filing'] },
  { emoji: '📤', keywords: ['outbox', 'send', 'upload', 'export', 'share'] },
  { emoji: '📥', keywords: ['inbox', 'receive', 'download', 'import', 'tray'] },
  { emoji: '🔧', keywords: ['settings', 'config', 'admin', 'maintenance', 'tool'] },
  { emoji: '🗑️', keywords: ['trash', 'delete', 'remove', 'garbage', 'bin', 'recycle'] },
  { emoji: '📎', keywords: ['paperclip', 'attach', 'attachment', 'clip', 'document'] },
  { emoji: '🖇️', keywords: ['paperclips', 'linked', 'attach', 'connect'] },
  { emoji: '📐', keywords: ['ruler', 'measure', 'angle', 'triangle', 'geometry'] },
  { emoji: '🗝️', keywords: ['key', 'old', 'antique', 'lock', 'access', 'secret'] },
  { emoji: '⛓️', keywords: ['chain', 'link', 'connect', 'blockchain', 'secure'] },
  { emoji: '🧮', keywords: ['calculator', 'math', 'abacus', 'count', 'compute', 'calculate'] },
  { emoji: '🧱', keywords: ['brick', 'wall', 'build', 'block', 'construct', 'lego'] },
  { emoji: '🪜', keywords: ['ladder', 'climb', 'steps', 'progress', 'level'] },
  { emoji: '🛗', keywords: ['elevator', 'lift', 'up', 'down', 'floor'] },
  { emoji: '🪟', keywords: ['window', 'glass', 'view', 'pane', 'frame', 'windows'] },
  { emoji: '🚪', keywords: ['door', 'entrance', 'exit', 'open', 'close', 'portal'] },
  { emoji: '💈', keywords: ['barber', 'pole', 'haircut', 'salon', 'shop'] },
  { emoji: '🏧', keywords: ['atm', 'bank', 'money', 'cash', 'withdraw'] },
  { emoji: '🛎️', keywords: ['bell', 'hotel', 'service', 'ring', 'reception'] },
  { emoji: '🧳', keywords: ['luggage', 'suitcase', 'travel', 'trip', 'bag'] },
  { emoji: '🪪', keywords: ['id', 'card', 'identity', 'badge', 'license', 'credential'] },
  { emoji: '📛', keywords: ['name', 'badge', 'tag', 'label', 'id'] },
  { emoji: '🔏', keywords: ['lock', 'pen', 'privacy', 'signed', 'secure'] },
  { emoji: '🔐', keywords: ['lock', 'key', 'secure', 'unlock', 'access'] },
  { emoji: '🧯', keywords: ['extinguisher', 'fire', 'safety', 'emergency'] },
  { emoji: '💊', keywords: ['pill', 'medicine', 'health', 'drug', 'pharmacy'] },
  { emoji: '🩻', keywords: ['xray', 'medical', 'scan', 'bone', 'skeleton'] },
  { emoji: '🔦', keywords: ['flashlight', 'torch', 'light', 'search', 'dark'] },
  { emoji: '🪫', keywords: ['battery', 'low', 'empty', 'charge', 'power'] },
  { emoji: '🏮', keywords: ['lantern', 'red', 'paper', 'light', 'chinese'] },
  { emoji: '🪔', keywords: ['lamp', 'diya', 'oil', 'light', 'flame'] },
  { emoji: '🧲', keywords: ['magnet', 'attract', 'force', 'pull'] },
  { emoji: '⏏️', keywords: ['eject', 'button', 'media', 'remove'] },
  { emoji: '📶', keywords: ['signal', 'bars', 'wireless', 'wifi', 'network', 'connection', 'strength'] },
  { emoji: '🔠', keywords: ['letters', 'uppercase', 'abc', 'alphabet', 'text'] },
  { emoji: '🔡', keywords: ['letters', 'lowercase', 'abc', 'alphabet', 'text'] },
  { emoji: '🔤', keywords: ['abc', 'letters', 'alphabet', 'text', 'input'] },
  { emoji: '🆎', keywords: ['blood', 'type', 'ab', 'medical'] },
  { emoji: '🆑', keywords: ['cl', 'clear', 'button', 'reset'] },
  { emoji: '🆘', keywords: ['sos', 'help', 'emergency', 'rescue'] },
  { emoji: '🔆', keywords: ['brightness', 'high', 'light', 'display'] },
  { emoji: '🔅', keywords: ['brightness', 'low', 'dim', 'display'] },
  { emoji: '🧪', keywords: ['test', 'experiment', 'lab', 'science', 'trial'] },
  { emoji: '🏷️', keywords: ['label', 'tag', 'price', 'sale', 'category'] },
  { emoji: '🪧', keywords: ['placard', 'sign', 'protest', 'board', 'display'] },

  // ─── Additional popular icons ───────────────────────────────────────────
  { emoji: '🪩', keywords: ['disco', 'ball', 'mirror', 'party', 'dance', 'music'] },
  { emoji: '🫀', keywords: ['heart', 'anatomical', 'organ', 'medical', 'health'] },
  { emoji: '🫁', keywords: ['lungs', 'breathe', 'medical', 'health', 'organ'] },
  { emoji: '🦷', keywords: ['tooth', 'dental', 'dentist', 'teeth', 'smile'] },
  { emoji: '🦴', keywords: ['bone', 'skeleton', 'anatomy', 'medical'] },
  { emoji: '👁️', keywords: ['eye', 'see', 'look', 'watch', 'vision', 'view', 'monitor'] },
  { emoji: '👂', keywords: ['ear', 'listen', 'hear', 'sound', 'audio'] },
  { emoji: '🦾', keywords: ['arm', 'mechanical', 'prosthetic', 'robot', 'strong', 'bionic'] },
  { emoji: '🦿', keywords: ['leg', 'prosthetic', 'mechanical', 'bionic', 'walk'] },
  { emoji: '🧲', keywords: ['magnet', 'attract', 'pull', 'force', 'magnetic'] },
  { emoji: '🪝', keywords: ['hook', 'catch', 'grab', 'fishing', 'hang'] },
  { emoji: '⚖️', keywords: ['scale', 'balance', 'justice', 'law', 'weight', 'compare', 'measure'] },
  { emoji: '🔖', keywords: ['bookmark', 'save', 'favorite', 'tag', 'mark'] },
  { emoji: '📊', keywords: ['bar', 'chart', 'graph', 'stats', 'analytics', 'report', 'data'] },
  { emoji: '🗺️', keywords: ['world', 'map', 'travel', 'globe', 'geography', 'navigate'] },
  { emoji: '🛤️', keywords: ['railway', 'track', 'train', 'path', 'road'] },
  { emoji: '⛽', keywords: ['fuel', 'gas', 'petrol', 'station', 'energy'] },
  { emoji: '🪨', keywords: ['rock', 'stone', 'solid', 'stable', 'foundation'] },
  { emoji: '🌾', keywords: ['rice', 'grain', 'farm', 'agriculture', 'wheat', 'harvest'] },
  { emoji: '🫐', keywords: ['blueberry', 'fruit', 'berry', 'blue'] },
  { emoji: '🍇', keywords: ['grape', 'fruit', 'wine', 'purple', 'bunch'] },
  { emoji: '🥝', keywords: ['kiwi', 'fruit', 'green', 'new zealand'] },
  { emoji: '🫘', keywords: ['beans', 'food', 'legume', 'coffee'] },
  { emoji: '🧈', keywords: ['butter', 'food', 'cooking', 'dairy', 'spread'] },
  { emoji: '🥐', keywords: ['croissant', 'bread', 'pastry', 'french', 'bakery'] },
  { emoji: '🥞', keywords: ['pancake', 'breakfast', 'stack', 'food'] },
  { emoji: '🥯', keywords: ['bagel', 'bread', 'food', 'breakfast'] },
  { emoji: '🫕', keywords: ['fondue', 'cheese', 'food', 'dip', 'swiss'] },
  { emoji: '🫗', keywords: ['pour', 'liquid', 'fill', 'water', 'glass'] },
];

const CATEGORIES = {
  suggested: { label: 'Suggested', icon: '✨' },
  business: { label: 'Business', icon: '💼' },
  tech: { label: 'Tech', icon: '💻' },
  tools: { label: 'Tools', icon: '🔧' },
  documents: { label: 'Docs', icon: '📝' },
  time: { label: 'Time', icon: '⏰' },
  communication: { label: 'Chat', icon: '💬' },
  targets: { label: 'Goals', icon: '🎯' },
  science: { label: 'Science', icon: '🧪' },
  nature: { label: 'Nature', icon: '🌿' },
  food: { label: 'Food', icon: '🍕' },
  health: { label: 'Health', icon: '❤️' },
  sports: { label: 'Sports', icon: '⚽' },
  media: { label: 'Media', icon: '🎵' },
  travel: { label: 'Travel', icon: '✈️' },
  animals: { label: 'Animals', icon: '🐶' },
  symbols: { label: 'Symbols', icon: '✅' },
  fun: { label: 'Fun', icon: '🎉' },
  all: { label: 'All', icon: '🔤' },
};

const CATEGORY_EMOJIS = {
  business: ['💰','💵','💳','💲','💱','🏦','📈','📉','📊','🧾','💼','🏢','🏪','🏬','🛒','🛍️','💎','🪙','💹','🤝'],
  tech: ['📱','💻','🖥️','⌨️','🖱️','🖨️','💾','💿','📀','📡','🔗','🌐','📲','🤖','🧠','🔑','🔐','🔒','🔓','🛡️','🧩','🔮','📟','📠','🖲️'],
  tools: ['🔧','🛠️','⚙️','🔩','⛏️','🪛','🪚','🔨','🏗️','🧰','🧲','⚡','🔌','🔋','💡'],
  documents: ['📝','📄','📃','📋','📑','📂','📁','🗂️','🗃️','📰','📖','📕','📗','📘','📙','📚','📓','📒','📔','🗒️','✏️','✒️','🖊️','🖋️','📮','✉️','📧','📨','📩','📬','🏷️','🔖'],
  time: ['📅','🗓️','📆','⏰','⏱️','⏲️','🕐','⌛','⏳'],
  communication: ['💬','💭','🗣️','📢','📣','🔔','🔕','📞','📳','👥','👤','👨‍💻','👩‍💻','👨‍💼','👩‍💼','👨‍🏫','👩‍🏫','👨‍🔬','👩‍🔬','👨‍🎨','👩‍🎨'],
  targets: ['🎯','🏆','🥇','🥈','🥉','🏅','⭐','🌟','✨','🎖️','🏁','🚩','📌','📍'],
  science: ['🧪','⚗️','🧬','🦠','⚛️','🧫','🔢','🔣','➕','➖','➗','✖️','♾️','📐','📏','🔬','🔭'],
  nature: ['🌊','🌍','🌎','🌏','☀️','🌤️','⛅','🌧️','⛈️','🌈','❄️','🔥','🌱','🌿','🍀','🌲','🌳','🌴','🌵','🌺','🌻','🌸','💐','🍄','🌋','⛰️','🏔️'],
  food: ['☕','🍵','🧃','🥤','🍺','🍷','🍔','🍕','🍰','🧁','🍳','🥗','🍎','🍊','🍋','🍉','🥑','🌶️','🍩','🍪'],
  health: ['❤️','💚','💙','💜','🧡','💛','🩺','💊','🩹','🏃','🏋️','🧘','🚴','🏊','🧗','🤸','🏌️'],
  sports: ['⚽','🏀','🏈','⚾','🎾','🏐','🎮','🕹️','🎲','♟️','🃏','🀄','🎰','🎳','🏓'],
  media: ['🎵','🎶','🎧','🎤','🎬','📹','📷','📸','🖼️','🎨','🎭','📺','📻','🎸','🎹','🎺','🥁','🎻'],
  travel: ['🚀','✈️','🚗','🚕','🚌','🚂','🚢','🛸','🗺️','🧭','🏠','🏡','🏘️','🏥','🏫','🏛️','🏭'],
  animals: ['🐶','🐱','🐻','🦊','🦁','🐝','🦋','🐢','🐬','🦅','🐦','🦉','🐙','🐍','🦈','🐺','🦄','🐲','🦖','🐸','🐒','🐛','🕷️','🐾','🦜'],
  symbols: ['✅','❌','⚠️','🚫','⛔','❓','❗','💯','🆕','🆓','🔴','🟢','🔵','🟡','🟠','🟣','ℹ️','🔄','⬆️','⬇️','➡️','⬅️'],
  fun: ['🎉','🎊','🎈','🎂','🎃','🎄','🎆','🎇','🧨','😀','😎','🤔','🤯','🥳','👻','💀','🤓','👑','🪄','💫'],
};

function suggestEmojis(appName) {
  if (!appName || !appName.trim()) return [];

  const tokens = appName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 1);

  if (tokens.length === 0) return [];

  const scored = new Map();

  for (const item of EMOJI_DB) {
    let score = 0;
    for (const token of tokens) {
      for (const kw of item.keywords) {
        if (kw === token) {
          score += 10;
        } else if (kw.startsWith(token) || token.startsWith(kw)) {
          score += 6;
        } else if (kw.includes(token) || token.includes(kw)) {
          score += 3;
        }
      }
    }
    if (score > 0) {
      const existing = scored.get(item.emoji) || 0;
      scored.set(item.emoji, Math.max(existing, score));
    }
  }

  return [...scored.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24)
    .map(([emoji]) => emoji);
}

function searchEmojis(query) {
  if (!query || !query.trim()) return getAllEmojis();

  const q = query.toLowerCase().trim();
  const scored = new Map();

  for (const item of EMOJI_DB) {
    let score = 0;
    if (item.emoji === q) {
      score = 100;
    }
    for (const kw of item.keywords) {
      if (kw === q) {
        score += 10;
      } else if (kw.startsWith(q)) {
        score += 7;
      } else if (kw.includes(q)) {
        score += 3;
      }
    }
    if (score > 0) {
      const existing = scored.get(item.emoji) || 0;
      scored.set(item.emoji, Math.max(existing, score));
    }
  }

  return [...scored.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([emoji]) => emoji);
}

function getAllEmojis() {
  const seen = new Set();
  const result = [];
  for (const item of EMOJI_DB) {
    if (!seen.has(item.emoji)) {
      seen.add(item.emoji);
      result.push(item.emoji);
    }
  }
  return result;
}

function getCategoryEmojis(category) {
  return CATEGORY_EMOJIS[category] || [];
}

export { EMOJI_DB, CATEGORIES, CATEGORY_EMOJIS, suggestEmojis, searchEmojis, getAllEmojis, getCategoryEmojis };
