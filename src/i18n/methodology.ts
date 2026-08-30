import type { Locale } from './config';

export interface MethodologyStep {
  title: string;
  paragraphs: string[];
  items?: string[];
  example?: { label: string; value: string }[];
}

export interface MethodologyContent {
  labels: { scoring: string; evidence: string; useCases: string; independence: string; dateVersion: string; traceability: string };
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string[];
  distinctions: string[];
  testsCta: string;
  why: { heading: string; paragraphs: string[]; questions: string[]; pipeline: string[] };
  protocolHeading: string;
  steps: MethodologyStep[];
  statusesHeading: string;
  statuses: Array<{ code: string; text: string; example?: string }>;
  coverage: { heading: string; paragraphs: string[]; labels: string[]; example: string[] };
  paid: { heading: string; paragraphs: string[]; checks: string[]; visible: string };
  limits: { heading: string; paragraphs: string[]; items: string[]; statement: string; explanation: string };
  scoring: { heading: string; paragraphs: string[]; dimensions: string[]; requirements: string[]; unscored: string };
  evidence: { heading: string; testedTitle: string; testedText: string; testedUses: string[]; documentedTitle: string; documentedText: string; documentedUses: string[]; warning: string };
  comparison: { heading: string; paragraphs: string[]; versus: string[]; dimensions: string[]; warning: string };
  useCases: { heading: string; paragraphs: string[]; items: string[]; statement: string };
  funding: { heading: string; paragraphs: string[]; unaffected: string[]; outcomes: string[]; cta: string };
  services: { heading: string; paragraphs: string[]; benefits: string[]; cta: string };
  versioning: { heading: string; paragraphs: string[]; labels: string[]; updates: string[] };
  jibble: { eyebrow: string; heading: string; cards: Array<{ code: string; title: string; text: string }>; cta: string };
  proofs: { heading: string; paragraphs: string[]; uses: string[] };
  final: { heading: string; text: string; distinctions: string[]; testsCta: string; servicesCta: string };
}

const fr: MethodologyContent = {
  labels:{scoring:'Scoring',evidence:'Preuve',useCases:'Cas d’usage',independence:'Indépendance',dateVersion:'Date & version',traceability:'Traçabilité'},
  title: 'Comment Datagraphe teste les logiciels | Méthodologie',
  description: 'Découvrez la méthodologie Datagraphe : scénarios réels, preuves, statuts de vérification, limites et scoring pour tester et comparer les logiciels destinés aux TPE et PME.',
  eyebrow: 'Protocole éditorial Datagraphe',
  heading: 'Tester, c’est agir puis observer.',
  intro: [
    'Datagraphe ne considère pas qu’une fonctionnalité est testée parce qu’elle apparaît dans un menu, une documentation ou une page commerciale.',
    'Pour qualifier une fonction de testée, nous essayons de l’utiliser dans un scénario concret, observons le résultat et documentons ce qui s’est réellement passé.',
  ],
  distinctions: ['Ce que nous avons testé', 'Ce que nous avons partiellement vérifié', 'Ce que nous n’avons pas pu tester', 'Ce qui n’était pas disponible'],
  testsCta: 'Voir les logiciels testés',
  why: {
    heading: 'Pourquoi Datagraphe a créé son propre protocole',
    paragraphs: ['De nombreux logiciels présentent plusieurs dizaines, voire plusieurs centaines de fonctionnalités. Une simple lecture de la documentation ne permet pas de savoir :'],
    questions: ['si la fonction est disponible dans le plan étudié', 'si elle est facile à configurer', 'si elle produit le résultat attendu', 'si des limitations apparaissent à l’usage', 'si elle dépend d’un appareil, d’une intégration ou d’un abonnement supérieur'],
    pipeline: ['Annoncé', 'Testé', 'Observé', 'Documenté'],
  },
  protocolHeading: 'Comment se déroule un test logiciel',
  steps: [
    { title: 'Inventaire', paragraphs: ['Nous inventorions les fonctionnalités accessibles ou annoncées afin de ne pas tester uniquement les plus visibles.'], items: ['Menus', 'Paramètres', 'Plans', 'Documentation', 'Fonctions payantes', 'Applications', 'Intégrations'] },
    { title: 'Environnement de test', paragraphs: ['Lorsque cela est possible, nous créons un environnement entièrement fictif. Aucune donnée réelle de salariés ou de clients n’est nécessaire.'], items: ['Entreprise fictive', 'Utilisateurs fictifs', 'Clients fictifs', 'Projets fictifs', 'Données fictives'] },
    { title: 'Scénarios', paragraphs: ['Nous transformons les fonctions en actions concrètes. Une fonctionnalité n’est pas réellement testée si aucune action correspondante n’a été exécutée.'], example: [{label:'Fonction annoncée',value:'Heures supplémentaires'},{label:'Scénario',value:'Créer une règle après 8 h → enregistrer une journée fictive de 9 h → observer le calcul.'}] },
    { title: 'Observation', paragraphs: ['Nous enregistrons ce qui était attendu et ce qui s’est réellement produit. Nous évitons de déduire un résultat que nous n’avons pas observé.'], items: ['Comportement attendu', 'Comportement observé', 'Erreurs et messages', 'Blocages et limitations', 'Plan utilisé'] },
    { title: 'Preuves', paragraphs: ['Lorsque cela est pertinent, chaque preuve peut être reliée au scénario correspondant.'], items: ['Captures d’écran', 'Exports', 'Messages d’erreur', 'Paramètres', 'Résultats', 'Références de menus', 'Identifiants de preuve'] },
    { title: 'Falsification', paragraphs: ['Nous ne cherchons pas seulement à confirmer les promesses. Une anomalie constatée fait partie du résultat du test.'], items: ['Ce qui ne fonctionne pas', 'Ce qui fonctionne autrement', 'Ce qui est compliqué', 'Ce qui nécessite un plan supérieur', 'Ce qui est impossible à vérifier'] },
    { title: 'Contrôle des affirmations', paragraphs: ['Avant publication, les affirmations importantes sont classées. Le texte publié doit correspondre au niveau réel de preuve.'], items: ['VERIFIED', 'PARTIAL', 'UNVERIFIED', 'CONTRADICTED'] },
    { title: 'Publication et mise à jour', paragraphs: ['Le dossier indique les fonctions testées, les avantages, les limites, les résultats inattendus, les fonctions non testées, les plans et la date. Une évolution importante peut déclencher une nouvelle vérification.'] },
  ],
  statusesHeading: 'Une fonction visible n’est pas forcément une fonction testée',
  statuses: [
    {code:'TESTED',text:'Action réellement exécutée, résultat observé et scénario suffisamment complet.',example:'Règle d’heures supplémentaires créée et résultat observé sur une journée fictive.'},
    {code:'PARTIAL',text:'Une partie du scénario a été réalisée, mais la validation reste incomplète.',example:'Période d’approbation créée sans exécuter la validation finale.'},
    {code:'NOT_TESTABLE',text:'La fonction nécessite un environnement que nous ne pouvons pas reproduire correctement.',example:'GPS physique, mode hors ligne réel, appareil mobile, kiosque ou matériel spécifique.'},
    {code:'BLOCKED',text:'Le scénario a commencé, mais une contrainte technique a empêché son achèvement.',example:'Téléchargement bloqué par l’environnement de test.'},
    {code:'NOT_AVAILABLE',text:'La fonction n’était pas accessible dans le plan, l’interface ou l’environnement étudié.'},
  ],
  coverage: {
    heading: 'Un test peut réussir même si la fonction échoue',
    paragraphs: ['Pour Datagraphe, TESTED ne signifie pas que la fonctionnalité fonctionne parfaitement. Cela signifie que nous avons réellement exécuté le scénario.', 'Le résultat peut ensuite être PASS, FAIL ou INCONCLUSIVE. Cette distinction évite de confondre couverture du test et qualité du logiciel.'],
    labels: ['Test', 'Action', 'Résultat observé', 'Couverture', 'Conclusion'],
    example: ['Affecter un utilisateur à un groupe', 'Affectation exécutée', 'Message d’erreur', 'TESTED', 'FAIL'],
  },
  paid: {
    heading: 'Comment nous testons les fonctions payantes',
    paragraphs: ['Lorsqu’un éditeur propose un essai gratuit d’un plan supérieur, Datagraphe peut l’utiliser pour examiner les fonctions payantes, sans souscrire volontairement à un abonnement sauf besoin spécifique clairement indiqué.'],
    checks: ['Le plan minimum nécessaire', 'L’accès pendant l’essai', 'Une action réellement exécutée', 'Un résultat observé', 'Une preuve lorsque cela est pertinent'],
    visible: 'Une fonction simplement visible dans un menu reste VISIBLE_NOT_TESTED, et non TESTED.',
  },
  limits: {
    heading: 'Nos tests ont aussi des limites',
    paragraphs: ['Un test sérieux doit expliquer ce qu’il n’a pas pu vérifier. Selon le logiciel et l’environnement, certaines fonctions peuvent nécessiter :'],
    items: ['Un téléphone physique', 'Plusieurs appareils', 'Un GPS réel', 'Une coupure réseau', 'Un équipement spécifique', 'Plusieurs utilisateurs réels', 'Un service externe', 'Une intégration payante', 'Un interlocuteur chez l’éditeur'],
    statement: 'NON TESTÉ ≠ MAUVAIS',
    explanation: 'Cela signifie simplement que nous ne disposons pas d’un niveau de preuve suffisant pour nous prononcer.',
  },
  scoring: {
    heading: 'Comment sont calculées les notes Datagraphe',
    paragraphs: ['Une note n’est attribuée que lorsque la catégorie a été suffisamment manipulée. Nous évitons les formules pseudo-scientifiques qui donnent une fausse impression de précision.'],
    dimensions: ['Prise en main', 'Ergonomie', 'Fonctionnalités principales', 'Administration', 'Rapports', 'Exports', 'Mobile', 'Intégrations', 'Rapport qualité-prix'],
    requirements: ['Dimensions prises en compte', 'Dimensions exclues', 'Date du test'],
    unscored: 'Si une dimension essentielle n’a pas été réellement testée, elle reste NON NOTÉE plutôt que recevoir une note artificielle.',
  },
  evidence: {
    heading: 'Ce que nous avons testé et ce que nous avons seulement documenté',
    testedTitle: 'Test réel', testedText: '« Nous avons exécuté cette action. »', testedUses: ['Verdict', 'Notation', 'Avantages et inconvénients', 'Vidéo Datagraphe'],
    documentedTitle: 'Documentation', documentedText: '« L’éditeur indique que cette fonction existe. »', documentedUses: ['Compléter une fiche', 'Identifier une fonction', 'Préparer un futur scénario'],
    warning: 'Une information documentaire ne doit jamais être présentée comme une fonction effectivement testée.',
  },
  comparison: {
    heading: 'Comment nous comparons deux logiciels',
    paragraphs: ['Un comparatif Datagraphe utilise idéalement la même grille de test pour les logiciels étudiés. Une fonction testée chez l’un mais seulement documentée chez l’autre doit être clairement distinguée.'],
    versus: ['Jibble', 'Clockify'],
    dimensions: ['Pointage', 'Feuilles de temps', 'Projets', 'GPS', 'Kiosque', 'Rapports', 'Exports', 'Prix', 'Ergonomie', 'Administration'],
    warning: 'Nous évitons ainsi les comparatifs fondés uniquement sur des tableaux marketing.',
  },
  useCases: {
    heading: 'Un logiciel peut être bon sans convenir à tout le monde',
    paragraphs: ['Datagraphe évalue également les logiciels par cas d’usage. Le verdict peut donc changer selon le besoin.'],
    items: ['TPE', 'PME', 'Équipes terrain', 'Agence', 'Restaurant', 'Commerce', 'Équipe projet', 'Multi-sites'],
    statement: 'Notre objectif n’est pas de trouver « le meilleur logiciel », mais le meilleur logiciel pour quel besoin.',
  },
  funding: {
    heading: 'Comment Datagraphe se finance',
    paragraphs: ['Certains liens peuvent être affiliés. Si un utilisateur achète un logiciel via ces liens, Datagraphe peut percevoir une commission sans surcoût.'],
    unaffected: ['Scénarios de test', 'Résultats observés', 'Limitations publiées', 'Anomalies constatées', 'Notes attribuées'],
    outcomes: ['Une mauvaise note', 'Une limitation importante', 'Un verdict négatif', 'Une recommandation vers une alternative'],
    cta: 'En savoir plus sur notre transparence',
  },
  services: {
    heading: 'Tests éditoriaux et prestations commerciales',
    paragraphs: ['Datagraphe propose aussi des services d’automatisation, d’intégration et de test logiciel. Ces prestations sont séparées de l’activité éditoriale.'],
    benefits: ['Une meilleure note', 'Un meilleur classement', 'Un verdict favorable'],
    cta: 'Découvrir Datagraphe Services',
  },
  versioning: {
    heading: 'Les logiciels changent',
    paragraphs: ['Une analyse est toujours rattachée à une période et, lorsque possible, à une version ou à un état du logiciel.'],
    labels: ['Test effectué le', 'Dernière vérification', 'Plan utilisé', 'Environnement'],
    updates: ['Mettre à jour certaines parties', 'Relancer les scénarios concernés', 'Modifier la note', 'Ajouter une mention « mise à jour en cours »'],
  },
  jibble: {
    eyebrow: 'Exemple réel', heading: 'Un exemple concret : Jibble',
    cards: [
      {code:'TESTED',title:'Pointage web',text:'Entrée → pause → reprise → sortie.'},
      {code:'OBSERVED',title:'Règle heures supplémentaires',text:'Journée fictive de 9 h avec seuil à 8 h → 1 h supplémentaire observée.'},
      {code:'NOT_VALIDATED',title:'GPS / kiosque / hors ligne',text:'Non testés sur un appareil réel dans l’environnement utilisé.'},
    ],
    cta: 'Voir notre test Jibble',
  },
  proofs: {
    heading: 'Pourquoi nous conservons les preuves',
    paragraphs: ['Toutes les preuves internes ne sont pas nécessairement publiées, notamment lorsqu’elles contiennent des informations techniques ou des éléments qui ne doivent pas être exposés.'],
    uses: ['Vérifier une affirmation avant publication', 'Retrouver le contexte d’un résultat', 'Distinguer une observation d’une supposition', 'Mettre à jour plus facilement un test', 'Comparer deux versions d’un logiciel'],
  },
  final: {
    heading: 'Nous préférons dire « nous ne l’avons pas testé » plutôt que prétendre savoir.',
    text: 'La valeur d’un test Datagraphe ne dépend pas du nombre de cases cochées, mais de notre capacité à distinguer clairement :',
    distinctions: ['Ce que nous savons', 'Ce que nous avons observé', 'Ce que nous ne pouvons pas encore affirmer'],
    testsCta: 'Voir les logiciels testés', servicesCta: 'Découvrir Datagraphe Services',
  },
};

const en: MethodologyContent = {
  ...fr,
  labels:{scoring:'Scoring',evidence:'Evidence',useCases:'Use cases',independence:'Independence',dateVersion:'Date & version',traceability:'Traceability'},
  title: 'How Datagraphe tests software | Methodology',
  description: 'Discover the Datagraphe methodology: real scenarios, evidence, verification statuses, limitations and scoring for testing and comparing software for small businesses.',
  eyebrow: 'Datagraphe editorial protocol', heading: 'Testing means acting, then observing.',
  intro: ['Datagraphe does not consider a feature tested merely because it appears in a menu, documentation or a sales page.', 'To call a feature tested, we try to use it in a concrete scenario, observe the result and document what actually happened.'],
  distinctions: ['What we tested', 'What we partially verified', 'What we could not test', 'What was unavailable'], testsCta: 'View tested software',
  why:{heading:'Why Datagraphe created its own protocol',paragraphs:['Many products advertise dozens or hundreds of features. Reading documentation alone cannot tell us:'],questions:['whether the feature is available in the plan reviewed','whether it is easy to configure','whether it produces the expected result','whether limitations appear in use','whether it depends on a device, integration or higher plan'],pipeline:['Announced','Tested','Observed','Documented']},
  protocolHeading:'How a software test is conducted',
  steps: fr.steps.map((_,index)=>([
    {title:'Inventory',paragraphs:['We list accessible or advertised features so that we do not test only the most visible ones.'],items:['Menus','Settings','Plans','Documentation','Paid features','Applications','Integrations']},
    {title:'Test environment',paragraphs:['Whenever possible, we create a fully fictional environment. No real employee or customer data is required.'],items:['Fictional company','Fictional users','Fictional customers','Fictional projects','Fictional data']},
    {title:'Scenarios',paragraphs:['We turn features into concrete actions. A feature is not truly tested if no corresponding action was executed.'],example:[{label:'Advertised feature',value:'Overtime'},{label:'Scenario',value:'Create a rule after 8 hours → record a fictional 9-hour day → observe the calculation.'}]},
    {title:'Observation',paragraphs:['We record what was expected and what actually happened. We do not infer results we did not observe.'],items:['Expected behaviour','Observed behaviour','Errors and messages','Blocks and limitations','Plan used']},
    {title:'Evidence',paragraphs:['Where relevant, every piece of evidence can be linked to its scenario.'],items:['Screenshots','Exports','Error messages','Settings','Results','Menu references','Evidence IDs']},
    {title:'Falsification',paragraphs:['We do not merely confirm product claims. An observed anomaly is part of the test result.'],items:['What does not work','What behaves differently','What is difficult','What requires a higher plan','What cannot be verified']},
    {title:'Claim review',paragraphs:['Before publication, important claims are classified. Published wording must match the actual level of evidence.'],items:['VERIFIED','PARTIAL','UNVERIFIED','CONTRADICTED']},
    {title:'Publication and updates',paragraphs:['The report identifies tested features, benefits, limitations, unexpected results, untested features, plans and date. A major change may trigger a new review.']},
  ] as MethodologyStep[])[index]),
  statusesHeading:'A visible feature is not necessarily a tested feature',
  statuses:[{code:'TESTED',text:'Action executed, result observed and scenario sufficiently complete.',example:'An overtime rule was created and its result observed on a fictional day.'},{code:'PARTIAL',text:'Part of the scenario was completed, but validation remains incomplete.',example:'An approval period was created without final approval.'},{code:'NOT_TESTABLE',text:'The feature requires an environment we cannot reproduce properly.',example:'Physical GPS, real offline mode, mobile device, kiosk or specific hardware.'},{code:'BLOCKED',text:'The scenario started, but a technical constraint prevented completion.',example:'A download was blocked by the test environment.'},{code:'NOT_AVAILABLE',text:'The feature was not accessible in the reviewed plan, interface or environment.'}],
  coverage:{heading:'A test can succeed even when the feature fails',paragraphs:['For Datagraphe, TESTED does not mean the feature works perfectly. It means we actually executed the scenario.','The outcome can then be PASS, FAIL or INCONCLUSIVE. This separates test coverage from product quality.'],labels:['Test','Action','Observed result','Coverage','Outcome'],example:['Assign a user to a group','Assignment executed','Error message','TESTED','FAIL']},
  paid:{heading:'How we test paid features',paragraphs:['When a vendor offers a free trial of a higher plan, Datagraphe may use it to examine paid features without deliberately subscribing, unless a specific need is clearly disclosed.'],checks:['Minimum required plan','Trial access','An action actually executed','An observed result','Evidence where relevant'],visible:'A feature merely visible in a menu remains VISIBLE_NOT_TESTED, not TESTED.'},
  limits:{heading:'Our tests also have limits',paragraphs:['A serious test must explain what it could not verify. Some features may require:'],items:['A physical phone','Several devices','Real GPS','A network outage','Specific hardware','Several real users','An external service','A paid integration','Human assistance from the vendor'],statement:'NOT TESTED ≠ BAD',explanation:'It simply means we do not have enough evidence to reach a conclusion.'},
  scoring:{heading:'How Datagraphe scores are calculated',paragraphs:['A score is assigned only when the category has been sufficiently exercised. We avoid pseudo-scientific formulas that create false precision.'],dimensions:['Onboarding','Usability','Core features','Administration','Reports','Exports','Mobile','Integrations','Value for money'],requirements:['Included dimensions','Excluded dimensions','Test date'],unscored:'If an essential dimension was not genuinely tested, it remains NOT SCORED rather than receiving an artificial score.'},
  evidence:{heading:'What we tested and what we only documented',testedTitle:'Real test',testedText:'“We executed this action.”',testedUses:['Verdict','Scoring','Pros and cons','Datagraphe video'],documentedTitle:'Documentation',documentedText:'“The vendor says this feature exists.”',documentedUses:['Complete a product sheet','Identify a feature','Prepare a future scenario'],warning:'Documentary information must never be presented as an actually tested feature.'},
  comparison:{heading:'How we compare two products',paragraphs:['A Datagraphe comparison should use the same test grid for the products reviewed. A feature tested in one product but only documented in another must be clearly distinguished.'],versus:['Jibble','Clockify'],dimensions:['Time clock','Timesheets','Projects','GPS','Kiosk','Reports','Exports','Price','Usability','Administration'],warning:'This avoids comparisons based solely on marketing tables.'},
  useCases:{heading:'Good software is not right for everyone',paragraphs:['Datagraphe also evaluates software by use case. The verdict may therefore change with the need.'],items:['Microbusiness','SMB','Field teams','Agency','Restaurant','Retail','Project team','Multi-site'],statement:'Our goal is not to find “the best software”, but the best software for which need.'},
  funding:{heading:'How Datagraphe is funded',paragraphs:['Some links may be affiliate links. If a user buys through them, Datagraphe may receive a commission at no extra cost.'],unaffected:['Test scenarios','Observed results','Published limitations','Observed anomalies','Scores'],outcomes:['A poor score','A major limitation','A negative verdict','A recommendation for an alternative'],cta:'Learn more about our transparency'},
  services:{heading:'Editorial tests and commercial services',paragraphs:['Datagraphe also provides software automation, integration and testing services. They are separate from editorial work.'],benefits:['A better score','A higher ranking','A favourable verdict'],cta:'Discover Datagraphe Services'},
  versioning:{heading:'Software changes',paragraphs:['An analysis is always tied to a period and, where available, a version or state of the product.'],labels:['Test performed on','Last verified','Plan used','Environment'],updates:['Update selected sections','Rerun relevant scenarios','Change the score','Add an “update in progress” notice']},
  jibble:{eyebrow:'Real example',heading:'A concrete example: Jibble',cards:[{code:'TESTED',title:'Web time clock',text:'Clock in → break → resume → clock out.'},{code:'OBSERVED',title:'Overtime rule',text:'Fictional 9-hour day with an 8-hour threshold → 1 overtime hour observed.'},{code:'NOT_VALIDATED',title:'GPS / kiosk / offline',text:'Not tested on a real device in the environment used.'}],cta:'View our Jibble test'},
  proofs:{heading:'Why we keep evidence',paragraphs:['Not all internal evidence is published, especially when it contains technical or non-public elements.'],uses:['Verify a claim before publication','Recover the context of a result','Separate observation from assumption','Update a test more easily','Compare two product versions']},
  final:{heading:'We would rather say “we did not test it” than pretend to know.',text:'The value of a Datagraphe test does not depend on the number of checked boxes, but on our ability to clearly distinguish:',distinctions:['What we know','What we observed','What we cannot yet claim'],testsCta:'View tested software',servicesCta:'Discover Datagraphe Services'},
};

function localize(base: MethodologyContent, locale: 'de'|'it'|'es'): MethodologyContent {
  const translations = {
    de: {
      title:'Wie Datagraphe Software testet | Methodik', description:'Entdecken Sie die Datagraphe-Methodik: reale Szenarien, Nachweise, Prüfstatus, Grenzen und Bewertung für Softwarevergleiche von KMU.', eyebrow:'Datagraphe-Redaktionsprotokoll', heading:'Testen heißt handeln und anschließend beobachten.',
      intro:['Datagraphe betrachtet eine Funktion nicht als getestet, nur weil sie in einem Menü, einer Dokumentation oder einer Verkaufsseite erscheint.','Damit eine Funktion als getestet gilt, setzen wir sie in einem konkreten Szenario ein, beobachten das Ergebnis und dokumentieren den tatsächlichen Ablauf.'], distinctions:['Was wir getestet haben','Was wir teilweise geprüft haben','Was wir nicht testen konnten','Was nicht verfügbar war'], testsCta:'Getestete Software ansehen',
      why:'Warum Datagraphe ein eigenes Protokoll entwickelt hat', protocol:'So läuft ein Softwaretest ab', statuses:'Eine sichtbare Funktion ist nicht automatisch getestet', coverage:'Ein Test kann erfolgreich sein, obwohl die Funktion scheitert', paid:'So testen wir kostenpflichtige Funktionen', limits:'Auch unsere Tests haben Grenzen', scoring:'So werden Datagraphe-Bewertungen berechnet', evidence:'Was wir getestet und was wir nur dokumentiert haben', comparison:'So vergleichen wir zwei Programme', useCases:'Gute Software passt nicht zu jedem', funding:'So finanziert sich Datagraphe', services:'Redaktionelle Tests und kommerzielle Leistungen', versioning:'Software verändert sich', proof:'Warum wir Nachweise aufbewahren', final:'Wir sagen lieber „wir haben es nicht getestet“, als Wissen vorzutäuschen.'
    },
    it: {
      title:'Come Datagraphe testa i software | Metodologia', description:'Scopri la metodologia Datagraphe: scenari reali, prove, stati di verifica, limiti e valutazioni per testare e confrontare software per PMI.', eyebrow:'Protocollo editoriale Datagraphe', heading:'Testare significa agire e poi osservare.',
      intro:['Datagraphe non considera testata una funzione solo perché appare in un menu, nella documentazione o in una pagina commerciale.','Per definirla testata, proviamo a usarla in uno scenario concreto, osserviamo il risultato e documentiamo ciò che è realmente accaduto.'], distinctions:['Cosa abbiamo testato','Cosa abbiamo verificato in parte','Cosa non abbiamo potuto testare','Cosa non era disponibile'], testsCta:'Vedi i software testati',
      why:'Perché Datagraphe ha creato un proprio protocollo', protocol:'Come si svolge un test software', statuses:'Una funzione visibile non è necessariamente testata', coverage:'Un test può riuscire anche se la funzione fallisce', paid:'Come testiamo le funzioni a pagamento', limits:'Anche i nostri test hanno limiti', scoring:'Come vengono calcolati i punteggi Datagraphe', evidence:'Cosa abbiamo testato e cosa abbiamo solo documentato', comparison:'Come confrontiamo due software', useCases:'Un buon software non è adatto a tutti', funding:'Come si finanzia Datagraphe', services:'Test editoriali e servizi commerciali', versioning:'Il software cambia', proof:'Perché conserviamo le prove', final:'Preferiamo dire «non lo abbiamo testato» piuttosto che fingere di sapere.'
    },
    es: {
      title:'Cómo prueba Datagraphe el software | Metodología', description:'Descubre la metodología Datagraphe: escenarios reales, pruebas, estados de verificación, límites y puntuación para comparar software para pymes.', eyebrow:'Protocolo editorial Datagraphe', heading:'Probar es actuar y después observar.',
      intro:['Datagraphe no considera que una función esté probada solo porque aparece en un menú, una documentación o una página comercial.','Para calificarla como probada, intentamos usarla en un escenario concreto, observamos el resultado y documentamos lo que ocurrió realmente.'], distinctions:['Lo que hemos probado','Lo que hemos verificado parcialmente','Lo que no hemos podido probar','Lo que no estaba disponible'], testsCta:'Ver el software probado',
      why:'Por qué Datagraphe creó su propio protocolo', protocol:'Cómo se realiza una prueba de software', statuses:'Una función visible no es necesariamente una función probada', coverage:'Una prueba puede tener éxito aunque la función falle', paid:'Cómo probamos las funciones de pago', limits:'Nuestras pruebas también tienen límites', scoring:'Cómo se calculan las puntuaciones Datagraphe', evidence:'Lo que hemos probado y lo que solo hemos documentado', comparison:'Cómo comparamos dos programas', useCases:'Un buen software no sirve para todo el mundo', funding:'Cómo se financia Datagraphe', services:'Pruebas editoriales y servicios comerciales', versioning:'El software cambia', proof:'Por qué conservamos las pruebas', final:'Preferimos decir «no lo hemos probado» antes que fingir que lo sabemos.'
    }
  }[locale];
  const stepText = {
    de:['Inventar','Testumgebung','Szenarien','Beobachtung','Nachweise','Falsifizierung','Prüfung der Aussagen','Veröffentlichung und Aktualisierung'],
    it:['Inventario','Ambiente di test','Scenari','Osservazione','Prove','Falsificazione','Controllo delle affermazioni','Pubblicazione e aggiornamento'],
    es:['Inventario','Entorno de prueba','Escenarios','Observación','Pruebas','Falsificación','Control de afirmaciones','Publicación y actualización'],
  }[locale];
  const statusText = {
    de:['Aktion ausgeführt, Ergebnis beobachtet und Szenario ausreichend vollständig.','Ein Teil des Szenarios wurde ausgeführt, die Prüfung bleibt jedoch unvollständig.','Die Funktion benötigt eine Umgebung, die wir nicht korrekt nachbilden können.','Das Szenario wurde begonnen, aber eine technische Einschränkung verhinderte den Abschluss.','Die Funktion war im untersuchten Tarif, in der Oberfläche oder Umgebung nicht verfügbar.'],
    it:['Azione eseguita, risultato osservato e scenario sufficientemente completo.','Una parte dello scenario è stata eseguita, ma la convalida resta incompleta.','La funzione richiede un ambiente che non possiamo riprodurre correttamente.','Lo scenario è iniziato, ma un vincolo tecnico ne ha impedito il completamento.','La funzione non era accessibile nel piano, nell’interfaccia o nell’ambiente esaminato.'],
    es:['Acción ejecutada, resultado observado y escenario suficientemente completo.','Se realizó parte del escenario, pero la validación sigue incompleta.','La función requiere un entorno que no podemos reproducir correctamente.','El escenario comenzó, pero una limitación técnica impidió terminarlo.','La función no estaba accesible en el plan, la interfaz o el entorno estudiado.'],
  }[locale];
  const localized = {
    de: {
      labels:{scoring:'Bewertung',evidence:'Nachweise',useCases:'Anwendungsfälle',independence:'Unabhängigkeit',dateVersion:'Datum & Version',traceability:'Nachvollziehbarkeit'},
      why:{heading:translations.why,paragraphs:['Viele Programme werben mit Dutzenden oder Hunderten Funktionen. Die Dokumentation allein beantwortet nicht:'],questions:['Ist die Funktion im untersuchten Tarif verfügbar?','Ist sie leicht einzurichten?','Liefert sie das erwartete Ergebnis?','Zeigen sich Einschränkungen bei der Nutzung?','Benötigt sie ein Gerät, eine Integration oder einen höheren Tarif?'],pipeline:['Angekündigt','Getestet','Beobachtet','Dokumentiert']},
      steps:[
        {title:stepText[0],paragraphs:['Wir erfassen zugängliche und angekündigte Funktionen, damit nicht nur die sichtbarsten getestet werden.'],items:['Menüs','Einstellungen','Tarife','Dokumentation','Bezahlfunktionen','Apps','Integrationen']},
        {title:stepText[1],paragraphs:['Wenn möglich, erstellen wir eine vollständig fiktive Umgebung. Reale Mitarbeiter- oder Kundendaten sind nicht erforderlich.'],items:['Fiktives Unternehmen','Fiktive Nutzer','Fiktive Kunden','Fiktive Projekte','Fiktive Daten']},
        {title:stepText[2],paragraphs:['Wir übersetzen Funktionen in konkrete Handlungen. Ohne ausgeführte Handlung gilt eine Funktion nicht als tatsächlich getestet.'],example:[{label:'Angekündigte Funktion',value:'Überstunden'},{label:'Szenario',value:'Regel nach 8 Stunden erstellen → fiktiven 9-Stunden-Tag erfassen → Berechnung beobachten.'}]},
        {title:stepText[3],paragraphs:['Wir halten Erwartung und tatsächliches Ergebnis fest. Nicht beobachtete Ergebnisse werden nicht abgeleitet.'],items:['Erwartetes Verhalten','Beobachtetes Verhalten','Fehler und Meldungen','Blockaden und Grenzen','Verwendeter Tarif']},
        {title:stepText[4],paragraphs:['Wenn sinnvoll, wird jeder Nachweis mit dem zugehörigen Szenario verknüpft.'],items:['Screenshots','Exporte','Fehlermeldungen','Einstellungen','Ergebnisse','Menüverweise','Nachweis-IDs']},
        {title:stepText[5],paragraphs:['Wir bestätigen nicht nur Produktversprechen. Eine beobachtete Anomalie gehört zum Testergebnis.'],items:['Was nicht funktioniert','Was anders funktioniert','Was kompliziert ist','Was einen höheren Tarif erfordert','Was nicht prüfbar ist']},
        {title:stepText[6],paragraphs:['Vor der Veröffentlichung werden wichtige Aussagen klassifiziert. Der Text muss dem tatsächlichen Nachweisniveau entsprechen.'],items:['VERIFIED','PARTIAL','UNVERIFIED','CONTRADICTED']},
        {title:stepText[7],paragraphs:['Der Bericht nennt getestete Funktionen, Vorteile, Grenzen, unerwartete Ergebnisse, nicht getestete Funktionen, Tarife und Datum. Größere Änderungen können eine neue Prüfung auslösen.']},
      ] as MethodologyStep[],
      statuses:base.statuses.map((s,i)=>({...s,text:statusText[i],example:[
        'Eine Überstundenregel wurde erstellt und an einem fiktiven Tag geprüft.',
        'Ein Freigabezeitraum wurde erstellt, aber die finale Freigabe nicht ausgeführt.',
        'Physisches GPS, echter Offline-Modus, Mobilgerät, Kiosk oder spezielle Hardware.',
        'Ein Download wurde durch die Testumgebung blockiert.',
        undefined,
      ][i]})),
      coverage:{heading:translations.coverage,paragraphs:['TESTED bedeutet bei Datagraphe nicht, dass eine Funktion perfekt arbeitet. Es bedeutet, dass das Szenario tatsächlich ausgeführt wurde.','Das Ergebnis kann anschließend PASS, FAIL oder INCONCLUSIVE sein. So trennen wir Testabdeckung und Produktqualität.'],labels:['Test','Aktion','Beobachtetes Ergebnis','Abdeckung','Ergebnis'],example:['Nutzer einer Gruppe zuordnen','Zuordnung ausgeführt','Fehlermeldung','TESTED','FAIL']},
      paid:{heading:translations.paid,paragraphs:['Bietet ein Anbieter eine kostenlose Testphase eines höheren Tarifs, kann Datagraphe damit Bezahlfunktionen prüfen, ohne bewusst ein Abo abzuschließen – außer ein besonderer Bedarf wird klar angegeben.'],checks:['Erforderlicher Mindesttarif','Zugang während der Testphase','Tatsächlich ausgeführte Aktion','Beobachtetes Ergebnis','Nachweis, wenn relevant'],visible:'Eine nur im Menü sichtbare Funktion bleibt VISIBLE_NOT_TESTED und nicht TESTED.'},
      limits:{heading:translations.limits,paragraphs:['Ein seriöser Test erklärt auch, was nicht geprüft werden konnte. Manche Funktionen benötigen:'],items:['Ein physisches Telefon','Mehrere Geräte','Echtes GPS','Einen Netzausfall','Spezielle Hardware','Mehrere reale Nutzer','Einen externen Dienst','Eine bezahlte Integration','Menschliche Hilfe des Anbieters'],statement:'NICHT GETESTET ≠ SCHLECHT',explanation:'Es bedeutet lediglich, dass die Nachweise für ein Urteil nicht ausreichen.'},
      scoring:{heading:translations.scoring,paragraphs:['Eine Bewertung wird erst vergeben, wenn die Kategorie ausreichend praktisch geprüft wurde. Pseudowissenschaftliche Formeln mit falscher Genauigkeit vermeiden wir.'],dimensions:['Einstieg','Bedienbarkeit','Kernfunktionen','Administration','Berichte','Exporte','Mobil','Integrationen','Preis-Leistung'],requirements:['Einbezogene Dimensionen','Ausgeschlossene Dimensionen','Testdatum'],unscored:'Wurde eine wesentliche Dimension nicht wirklich getestet, bleibt sie OHNE BEWERTUNG statt eine künstliche Note zu erhalten.'},
      evidence:{heading:translations.evidence,testedTitle:'Realer Test',testedText:'„Wir haben diese Aktion ausgeführt.“',testedUses:['Urteil','Bewertung','Vor- und Nachteile','Datagraphe-Video'],documentedTitle:'Dokumentation',documentedText:'„Der Anbieter gibt an, dass diese Funktion existiert.“',documentedUses:['Produktprofil ergänzen','Funktion identifizieren','Künftiges Szenario vorbereiten'],warning:'Dokumentationsangaben dürfen niemals als tatsächlich getestete Funktion dargestellt werden.'},
      comparison:{heading:translations.comparison,paragraphs:['Ein Datagraphe-Vergleich verwendet idealerweise dasselbe Testraster. Eine bei einem Produkt getestete, beim anderen aber nur dokumentierte Funktion wird klar unterschieden.'],versus:['Jibble','Clockify'],dimensions:['Zeiterfassung','Stundenzettel','Projekte','GPS','Kiosk','Berichte','Exporte','Preis','Bedienbarkeit','Administration'],warning:'So vermeiden wir Vergleiche, die nur auf Marketingtabellen beruhen.'},
      useCases:{heading:translations.useCases,paragraphs:['Datagraphe bewertet Software auch nach Anwendungsfall. Das Urteil kann sich je nach Bedarf ändern.'],items:['Kleinstunternehmen','KMU','Außendienst','Agentur','Restaurant','Handel','Projektteam','Mehrere Standorte'],statement:'Unser Ziel ist nicht „die beste Software“, sondern die beste Software für welchen Bedarf.'},
      funding:{heading:translations.funding,paragraphs:['Einige Links können Affiliate-Links sein. Bei einem Kauf kann Datagraphe ohne Mehrkosten eine Provision erhalten.'],unaffected:['Testszenarien','Beobachtete Ergebnisse','Veröffentlichte Grenzen','Festgestellte Anomalien','Bewertungen'],outcomes:['Eine schlechte Note','Eine wichtige Einschränkung','Ein negatives Urteil','Empfehlung einer Alternative'],cta:'Mehr über unsere Transparenz'},
      services:{heading:translations.services,paragraphs:['Datagraphe bietet auch Automatisierungs-, Integrations- und Softwaretestleistungen an. Diese sind von der Redaktion getrennt.'],benefits:['Eine bessere Note','Eine bessere Platzierung','Ein positives Urteil'],cta:'Datagraphe Services entdecken'},
      versioning:{heading:translations.versioning,paragraphs:['Eine Analyse gehört immer zu einem Zeitraum und, soweit verfügbar, zu einer Version oder einem Zustand des Produkts.'],labels:['Test durchgeführt am','Zuletzt geprüft','Verwendeter Tarif','Umgebung'],updates:['Ausgewählte Abschnitte aktualisieren','Betroffene Szenarien erneut ausführen','Bewertung ändern','Hinweis „Aktualisierung läuft“ ergänzen']},
      jibble:{eyebrow:'Reales Beispiel',heading:'Ein konkretes Beispiel: Jibble',cards:[{code:'TESTED',title:'Web-Zeiterfassung',text:'Start → Pause → Fortsetzen → Ende.'},{code:'OBSERVED',title:'Überstundenregel',text:'Fiktiver 9-Stunden-Tag mit 8-Stunden-Schwelle → 1 Überstunde beobachtet.'},{code:'NOT_VALIDATED',title:'GPS / Kiosk / Offline',text:'In der verwendeten Umgebung nicht auf einem realen Gerät getestet.'}],cta:'Unseren Jibble-Test ansehen'},
      proofs:{heading:translations.proof,paragraphs:['Nicht alle internen Nachweise werden veröffentlicht, insbesondere bei technischen oder nicht öffentlichen Inhalten.'],uses:['Aussage vor Veröffentlichung prüfen','Kontext eines Ergebnisses wiederfinden','Beobachtung von Annahme trennen','Test leichter aktualisieren','Zwei Produktversionen vergleichen']},
      final:{heading:translations.final,text:'Der Wert eines Datagraphe-Tests hängt nicht von der Zahl abgehakter Felder ab, sondern davon, klar zu unterscheiden:',distinctions:['Was wir wissen','Was wir beobachtet haben','Was wir noch nicht behaupten können'],testsCta:'Getestete Software ansehen',servicesCta:'Datagraphe Services entdecken'},
    },
    it: {
      labels:{scoring:'Valutazione',evidence:'Prove',useCases:'Casi d’uso',independence:'Indipendenza',dateVersion:'Data e versione',traceability:'Tracciabilità'},
      why:{heading:translations.why,paragraphs:['Molti software presentano decine o centinaia di funzioni. La sola documentazione non permette di sapere:'],questions:['se la funzione è disponibile nel piano esaminato','se è facile da configurare','se produce il risultato atteso','se emergono limiti durante l’uso','se dipende da un dispositivo, un’integrazione o un piano superiore'],pipeline:['Annunciato','Testato','Osservato','Documentato']},
      steps:[
        {title:stepText[0],paragraphs:['Inventariamo le funzioni accessibili o annunciate per non testare soltanto quelle più visibili.'],items:['Menu','Impostazioni','Piani','Documentazione','Funzioni a pagamento','Applicazioni','Integrazioni']},
        {title:stepText[1],paragraphs:['Quando possibile creiamo un ambiente interamente fittizio, senza dati reali di dipendenti o clienti.'],items:['Azienda fittizia','Utenti fittizi','Clienti fittizi','Progetti fittizi','Dati fittizi']},
        {title:stepText[2],paragraphs:['Trasformiamo le funzioni in azioni concrete. Senza un’azione eseguita, una funzione non è realmente testata.'],example:[{label:'Funzione annunciata',value:'Straordinari'},{label:'Scenario',value:'Creare una regola dopo 8 ore → registrare una giornata fittizia di 9 ore → osservare il calcolo.'}]},
        {title:stepText[3],paragraphs:['Registriamo ciò che ci aspettavamo e ciò che è realmente accaduto. Non deduciamo risultati non osservati.'],items:['Comportamento atteso','Comportamento osservato','Errori e messaggi','Blocchi e limiti','Piano utilizzato']},
        {title:stepText[4],paragraphs:['Quando pertinente, ogni prova può essere collegata allo scenario corrispondente.'],items:['Schermate','Esportazioni','Messaggi di errore','Impostazioni','Risultati','Riferimenti ai menu','ID delle prove']},
        {title:stepText[5],paragraphs:['Non cerchiamo solo conferme. Un’anomalia osservata fa parte del risultato.'],items:['Ciò che non funziona','Ciò che funziona diversamente','Ciò che è complicato','Ciò che richiede un piano superiore','Ciò che non è verificabile']},
        {title:stepText[6],paragraphs:['Prima della pubblicazione classifichiamo le affermazioni importanti. Il testo deve rispettare il livello reale di prova.'],items:['VERIFIED','PARTIAL','UNVERIFIED','CONTRADICTED']},
        {title:stepText[7],paragraphs:['Il dossier indica funzioni testate, vantaggi, limiti, risultati inattesi, funzioni non testate, piani e data. Un cambiamento importante può richiedere una nuova verifica.']},
      ] as MethodologyStep[],
      statuses:base.statuses.map((s,i)=>({...s,text:statusText[i],example:['Regola straordinari creata e risultato osservato in una giornata fittizia.','Periodo di approvazione creato senza convalida finale.','GPS fisico, modalità offline reale, dispositivo mobile, chiosco o hardware specifico.','Download bloccato dall’ambiente di test.',undefined][i]})),
      coverage:{heading:translations.coverage,paragraphs:['Per Datagraphe TESTED non significa che la funzione sia perfetta, ma che lo scenario è stato realmente eseguito.','Il risultato può poi essere PASS, FAIL o INCONCLUSIVE. Così distinguiamo copertura del test e qualità del software.'],labels:['Test','Azione','Risultato osservato','Copertura','Esito'],example:['Assegnare un utente a un gruppo','Assegnazione eseguita','Messaggio di errore','TESTED','FAIL']},
      paid:{heading:translations.paid,paragraphs:['Se l’editore offre una prova gratuita di un piano superiore, Datagraphe può usarla per esaminare le funzioni a pagamento senza sottoscrivere volontariamente un abbonamento, salvo necessità dichiarata.'],checks:['Piano minimo richiesto','Accesso durante la prova','Azione realmente eseguita','Risultato osservato','Prova quando pertinente'],visible:'Una funzione solo visibile in un menu resta VISIBLE_NOT_TESTED, non TESTED.'},
      limits:{heading:translations.limits,paragraphs:['Un test serio spiega anche ciò che non è stato possibile verificare. Alcune funzioni possono richiedere:'],items:['Un telefono fisico','Più dispositivi','GPS reale','Interruzione di rete','Hardware specifico','Più utenti reali','Servizio esterno','Integrazione a pagamento','Assistenza umana dell’editore'],statement:'NON TESTATO ≠ SCADENTE',explanation:'Significa solo che non abbiamo prove sufficienti per esprimere un giudizio.'},
      scoring:{heading:translations.scoring,paragraphs:['Assegniamo un voto solo quando la categoria è stata utilizzata a sufficienza. Evitiamo formule pseudo-scientifiche che creano falsa precisione.'],dimensions:['Primo utilizzo','Usabilità','Funzioni principali','Amministrazione','Report','Esportazioni','Mobile','Integrazioni','Qualità-prezzo'],requirements:['Dimensioni incluse','Dimensioni escluse','Data del test'],unscored:'Se una dimensione essenziale non è stata realmente testata, resta NON VALUTATA invece di ricevere un voto artificiale.'},
      evidence:{heading:translations.evidence,testedTitle:'Test reale',testedText:'«Abbiamo eseguito questa azione.»',testedUses:['Verdetto','Valutazione','Vantaggi e svantaggi','Video Datagraphe'],documentedTitle:'Documentazione',documentedText:'«L’editore dichiara che questa funzione esiste.»',documentedUses:['Completare una scheda','Identificare una funzione','Preparare uno scenario futuro'],warning:'Un’informazione documentale non deve essere presentata come funzione realmente testata.'},
      comparison:{heading:translations.comparison,paragraphs:['Un confronto Datagraphe usa idealmente la stessa griglia. Una funzione testata in un prodotto ma solo documentata nell’altro deve essere distinta chiaramente.'],versus:['Jibble','Clockify'],dimensions:['Timbratura','Timesheet','Progetti','GPS','Chiosco','Report','Esportazioni','Prezzo','Usabilità','Amministrazione'],warning:'Evitiamo così confronti basati soltanto su tabelle marketing.'},
      useCases:{heading:translations.useCases,paragraphs:['Datagraphe valuta i software anche per caso d’uso. Il verdetto può cambiare secondo l’esigenza.'],items:['Microimpresa','PMI','Team sul campo','Agenzia','Ristorante','Commercio','Team di progetto','Multi-sede'],statement:'Non cerchiamo «il miglior software», ma il miglior software per quale esigenza.'},
      funding:{heading:translations.funding,paragraphs:['Alcuni link possono essere affiliati. In caso di acquisto Datagraphe può ricevere una commissione senza costi aggiuntivi.'],unaffected:['Scenari di test','Risultati osservati','Limiti pubblicati','Anomalie rilevate','Punteggi'],outcomes:['Un voto basso','Un limite importante','Un verdetto negativo','La raccomandazione di un’alternativa'],cta:'Scopri la nostra trasparenza'},
      services:{heading:translations.services,paragraphs:['Datagraphe offre anche servizi di automazione, integrazione e test software, separati dall’attività editoriale.'],benefits:['Un voto migliore','Una posizione migliore','Un verdetto favorevole'],cta:'Scopri Datagraphe Services'},
      versioning:{heading:translations.versioning,paragraphs:['Ogni analisi è legata a un periodo e, quando disponibile, a una versione o a uno stato del software.'],labels:['Test effettuato il','Ultima verifica','Piano utilizzato','Ambiente'],updates:['Aggiornare alcune parti','Ripetere gli scenari interessati','Modificare il voto','Aggiungere «aggiornamento in corso»']},
      jibble:{eyebrow:'Esempio reale',heading:'Un esempio concreto: Jibble',cards:[{code:'TESTED',title:'Timbratura web',text:'Entrata → pausa → ripresa → uscita.'},{code:'OBSERVED',title:'Regola straordinari',text:'Giornata fittizia di 9 ore con soglia a 8 → osservata 1 ora di straordinario.'},{code:'NOT_VALIDATED',title:'GPS / chiosco / offline',text:'Non testati su un dispositivo reale nell’ambiente usato.'}],cta:'Vedi il nostro test Jibble'},
      proofs:{heading:translations.proof,paragraphs:['Non tutte le prove interne vengono pubblicate, soprattutto se contengono elementi tecnici o non pubblici.'],uses:['Verificare un’affermazione prima della pubblicazione','Ritrovare il contesto di un risultato','Distinguere osservazione e supposizione','Aggiornare più facilmente un test','Confrontare due versioni']},
      final:{heading:translations.final,text:'Il valore di un test Datagraphe non dipende dal numero di caselle spuntate, ma dalla capacità di distinguere:',distinctions:['Ciò che sappiamo','Ciò che abbiamo osservato','Ciò che non possiamo ancora affermare'],testsCta:'Vedi i software testati',servicesCta:'Scopri Datagraphe Services'},
    },
    es: {
      labels:{scoring:'Puntuación',evidence:'Pruebas',useCases:'Casos de uso',independence:'Independencia',dateVersion:'Fecha y versión',traceability:'Trazabilidad'},
      why:{heading:translations.why,paragraphs:['Muchos programas presentan decenas o cientos de funciones. Leer la documentación no permite saber:'],questions:['si la función está disponible en el plan estudiado','si es fácil de configurar','si produce el resultado esperado','si aparecen límites durante el uso','si depende de un dispositivo, integración o plan superior'],pipeline:['Anunciado','Probado','Observado','Documentado']},
      steps:[
        {title:stepText[0],paragraphs:['Inventariamos las funciones accesibles o anunciadas para no probar solo las más visibles.'],items:['Menús','Ajustes','Planes','Documentación','Funciones de pago','Aplicaciones','Integraciones']},
        {title:stepText[1],paragraphs:['Cuando es posible creamos un entorno totalmente ficticio, sin datos reales de empleados o clientes.'],items:['Empresa ficticia','Usuarios ficticios','Clientes ficticios','Proyectos ficticios','Datos ficticios']},
        {title:stepText[2],paragraphs:['Convertimos las funciones en acciones concretas. Sin una acción ejecutada, una función no está realmente probada.'],example:[{label:'Función anunciada',value:'Horas extra'},{label:'Escenario',value:'Crear una regla tras 8 horas → registrar una jornada ficticia de 9 horas → observar el cálculo.'}]},
        {title:stepText[3],paragraphs:['Registramos lo esperado y lo que ocurrió realmente. No deducimos resultados que no observamos.'],items:['Comportamiento esperado','Comportamiento observado','Errores y mensajes','Bloqueos y límites','Plan utilizado']},
        {title:stepText[4],paragraphs:['Cuando es pertinente, cada prueba puede vincularse con su escenario.'],items:['Capturas','Exportaciones','Mensajes de error','Ajustes','Resultados','Referencias de menús','Identificadores de prueba']},
        {title:stepText[5],paragraphs:['No buscamos solo confirmar promesas. Una anomalía observada forma parte del resultado.'],items:['Lo que no funciona','Lo que funciona de otro modo','Lo que es complicado','Lo que exige un plan superior','Lo que no se puede verificar']},
        {title:stepText[6],paragraphs:['Antes de publicar clasificamos las afirmaciones importantes. El texto debe reflejar el nivel real de prueba.'],items:['VERIFIED','PARTIAL','UNVERIFIED','CONTRADICTED']},
        {title:stepText[7],paragraphs:['El informe indica funciones probadas, ventajas, límites, resultados inesperados, funciones no probadas, planes y fecha. Un cambio importante puede exigir otra verificación.']},
      ] as MethodologyStep[],
      statuses:base.statuses.map((s,i)=>({...s,text:statusText[i],example:['Regla de horas extra creada y resultado observado en una jornada ficticia.','Periodo de aprobación creado sin validación final.','GPS físico, modo offline real, dispositivo móvil, quiosco o hardware específico.','Descarga bloqueada por el entorno de prueba.',undefined][i]})),
      coverage:{heading:translations.coverage,paragraphs:['Para Datagraphe, TESTED no significa que la función sea perfecta, sino que ejecutamos realmente el escenario.','El resultado puede ser PASS, FAIL o INCONCLUSIVE. Así separamos cobertura de la prueba y calidad del software.'],labels:['Prueba','Acción','Resultado observado','Cobertura','Resultado'],example:['Asignar un usuario a un grupo','Asignación ejecutada','Mensaje de error','TESTED','FAIL']},
      paid:{heading:translations.paid,paragraphs:['Si el editor ofrece una prueba gratuita de un plan superior, Datagraphe puede usarla para examinar funciones de pago sin suscribirse voluntariamente, salvo necesidad específica indicada.'],checks:['Plan mínimo necesario','Acceso durante la prueba','Acción realmente ejecutada','Resultado observado','Prueba cuando sea pertinente'],visible:'Una función solo visible en un menú sigue siendo VISIBLE_NOT_TESTED, no TESTED.'},
      limits:{heading:translations.limits,paragraphs:['Una prueba seria también explica lo que no pudo verificar. Algunas funciones pueden requerir:'],items:['Un teléfono físico','Varios dispositivos','GPS real','Un corte de red','Equipo específico','Varios usuarios reales','Servicio externo','Integración de pago','Ayuda humana del editor'],statement:'NO PROBADO ≠ MALO',explanation:'Solo significa que no tenemos pruebas suficientes para emitir una conclusión.'},
      scoring:{heading:translations.scoring,paragraphs:['Solo asignamos una puntuación cuando la categoría ha sido suficientemente utilizada. Evitamos fórmulas pseudocientíficas que crean una falsa precisión.'],dimensions:['Primer uso','Usabilidad','Funciones principales','Administración','Informes','Exportaciones','Móvil','Integraciones','Calidad-precio'],requirements:['Dimensiones incluidas','Dimensiones excluidas','Fecha de prueba'],unscored:'Si una dimensión esencial no se ha probado realmente, queda SIN PUNTUAR en vez de recibir una nota artificial.'},
      evidence:{heading:translations.evidence,testedTitle:'Prueba real',testedText:'«Hemos ejecutado esta acción.»',testedUses:['Veredicto','Puntuación','Ventajas e inconvenientes','Vídeo Datagraphe'],documentedTitle:'Documentación',documentedText:'«El editor indica que esta función existe.»',documentedUses:['Completar una ficha','Identificar una función','Preparar un futuro escenario'],warning:'La información documental nunca debe presentarse como una función realmente probada.'},
      comparison:{heading:translations.comparison,paragraphs:['Una comparación Datagraphe utiliza idealmente la misma cuadrícula. Una función probada en un producto pero solo documentada en el otro debe distinguirse.'],versus:['Jibble','Clockify'],dimensions:['Fichaje','Hojas de horas','Proyectos','GPS','Quiosco','Informes','Exportaciones','Precio','Usabilidad','Administración'],warning:'Así evitamos comparaciones basadas únicamente en tablas comerciales.'},
      useCases:{heading:translations.useCases,paragraphs:['Datagraphe también evalúa el software por caso de uso. El veredicto puede cambiar según la necesidad.'],items:['Microempresa','Pyme','Equipos de campo','Agencia','Restaurante','Comercio','Equipo de proyecto','Multisede'],statement:'No buscamos «el mejor software», sino el mejor software para qué necesidad.'},
      funding:{heading:translations.funding,paragraphs:['Algunos enlaces pueden ser afiliados. Si un usuario compra, Datagraphe puede recibir una comisión sin coste adicional.'],unaffected:['Escenarios de prueba','Resultados observados','Límites publicados','Anomalías constatadas','Puntuaciones'],outcomes:['Una mala nota','Un límite importante','Un veredicto negativo','Recomendación de una alternativa'],cta:'Más información sobre nuestra transparencia'},
      services:{heading:translations.services,paragraphs:['Datagraphe también ofrece servicios de automatización, integración y pruebas de software, separados de la actividad editorial.'],benefits:['Una nota mejor','Una clasificación superior','Un veredicto favorable'],cta:'Descubrir Datagraphe Services'},
      versioning:{heading:translations.versioning,paragraphs:['Cada análisis está vinculado a un periodo y, cuando se conoce, a una versión o estado del software.'],labels:['Prueba realizada el','Última verificación','Plan utilizado','Entorno'],updates:['Actualizar determinadas partes','Repetir los escenarios afectados','Modificar la puntuación','Añadir «actualización en curso»']},
      jibble:{eyebrow:'Ejemplo real',heading:'Un ejemplo concreto: Jibble',cards:[{code:'TESTED',title:'Fichaje web',text:'Entrada → pausa → reanudación → salida.'},{code:'OBSERVED',title:'Regla de horas extra',text:'Jornada ficticia de 9 h con umbral de 8 h → observada 1 h extra.'},{code:'NOT_VALIDATED',title:'GPS / quiosco / offline',text:'No probados en un dispositivo real en el entorno utilizado.'}],cta:'Ver nuestra prueba de Jibble'},
      proofs:{heading:translations.proof,paragraphs:['No todas las pruebas internas se publican, especialmente si contienen elementos técnicos o no públicos.'],uses:['Verificar una afirmación antes de publicar','Recuperar el contexto de un resultado','Distinguir observación y suposición','Actualizar una prueba más fácilmente','Comparar dos versiones']},
      final:{heading:translations.final,text:'El valor de una prueba Datagraphe no depende del número de casillas marcadas, sino de distinguir claramente:',distinctions:['Lo que sabemos','Lo que hemos observado','Lo que aún no podemos afirmar'],testsCta:'Ver el software probado',servicesCta:'Descubrir Datagraphe Services'},
    },
  }[locale];
  return {
    ...base, title:translations.title,description:translations.description,eyebrow:translations.eyebrow,heading:translations.heading,intro:translations.intro,distinctions:translations.distinctions,testsCta:translations.testsCta,
    protocolHeading:translations.protocol,statusesHeading:translations.statuses,
    ...localized,
  };
}

export const methodologyCopy: Record<Locale, MethodologyContent> = {
  fr,
  en,
  de: localize(en,'de'),
  it: localize(en,'it'),
  es: localize(en,'es'),
};
