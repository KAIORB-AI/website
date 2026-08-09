/* KAI247 — Capabilities constellation: the workflow data.
 *
 * Split out from constellations.js so the shapes can be read and edited
 * without scrolling past the renderer.
 *
 * Every workflow declares a LAYOUT, because eight families all drawn as the
 * same left-to-right chain looked like one diagram repeated sixteen times.
 * The shape should say something before you read a word:
 *
 *   chain   a straight pipeline, one thing after another
 *   branch  one trigger, parallel lanes, merged back together
 *   loop    a pipeline that retries until a condition holds
 *   fanin   several sources converging into one process
 *   grid    independent checks running side by side into one output
 *
 * Node counts run from 3 to 12 on purpose, so panels are visibly different
 * heights rather than uniform blocks.
 *
 * HONESTY: these are ILLUSTRATIVE. They show the shape of automation in each
 * area; they are not a claim that KAI247 runs these exact pipelines for a
 * customer today, and the panel says so in a badge. Do not drop that badge,
 * and do not add a workflow describing something the network cannot build.
 */
window.KAI_CONSTELLATIONS = [
  {
    id: 'ai', name: 'AI & Intelligence', angle: 0, icon: 'ai',
    blurb: 'AI agents, MCP servers, multi-agent workflows, RAG, and private deployments.',
    workflows: [
      {
        name: 'Multi-agent research desk', layout: 'branch',
        trigger: 'On question received',
        pre: [['trigger', 'Question arrives'], ['ai', 'Plan the work']],
        lanes: [
          [['action', 'Search the web'], ['ai', 'Extract claims']],
          [['action', 'Query internal docs'], ['ai', 'Extract claims']],
          [['action', 'Read the database'], ['ai', 'Summarise rows']]
        ],
        post: [['ai', 'Reconcile conflicts'], ['check', 'Every claim sourced?'], ['output', 'Answer with citations']]
      },
      {
        name: 'Nightly knowledge refresh', layout: 'loop',
        trigger: 'Every night, 02:00',
        steps: [['trigger', 'Schedule fires'], ['action', 'Crawl changed pages'], ['ai', 'Chunk and embed'], ['check', 'Index healthy?']],
        back: 'Re-embed what failed',
        tail: [['output', 'Report drift']]
      }
    ]
  },
  {
    id: 'software', name: 'Software Engineering', angle: 45, icon: 'software',
    blurb: 'Custom SaaS, APIs, portals, ERP/CRM integrations, and desktop automation.',
    workflows: [
      {
        name: 'Merge to production', layout: 'chain',
        trigger: 'On pull request merged',
        steps: [['trigger', 'PR merged'], ['action', 'Run test suite'], ['check', 'All green?'],
                ['action', 'Build image'], ['action', 'Deploy to staging'], ['check', 'Smoke tests pass'],
                ['human', 'Release approved'], ['output', 'Promote to production']]
      },
      {
        name: 'Flaky test quarantine', layout: 'loop',
        trigger: 'On test failure',
        steps: [['trigger', 'Test fails'], ['action', 'Re-run in isolation'], ['check', 'Fails again?']],
        back: 'Retry up to three times',
        tail: [['action', 'Quarantine and file an issue']]
      }
    ]
  },
  {
    id: 'commerce', name: 'Web & Commerce', angle: 90, icon: 'commerce',
    blurb: 'Fast web applications, e-commerce platforms, CMS, and managed hosting.',
    workflows: [
      {
        name: 'Supplier catalog sync', layout: 'fanin',
        trigger: 'Every 6 hours',
        sources: [['trigger', 'Supplier A feed'], ['trigger', 'Supplier B feed'], ['trigger', 'Warehouse stock']],
        steps: [['action', 'Normalise fields'], ['check', 'Price rules hold'], ['action', 'Publish changes'], ['output', 'Reindex search']]
      },
      {
        name: 'Recover an abandoned cart', layout: 'chain',
        trigger: 'On cart idle 30 min',
        steps: [['trigger', 'Cart goes quiet'], ['check', 'Still in stock?'], ['ai', 'Pick the right nudge'],
                ['action', 'Send one email'], ['output', 'Stop on purchase']]
      }
    ]
  },
  {
    id: 'growth', name: 'Growth & Marketing', angle: 135, icon: 'growth',
    blurb: 'Technical SEO, GEO/AEO optimization, campaign tracking, and lead generation.',
    workflows: [
      {
        name: 'One brief, every channel', layout: 'branch',
        trigger: 'On brief approved',
        pre: [['trigger', 'Brief approved']],
        lanes: [
          [['ai', 'Long-form article']],
          [['ai', 'Social variants']],
          [['ai', 'Email version']],
          [['ai', 'Ad copy']]
        ],
        post: [['check', 'On brand and sourced?'], ['human', 'Editor approves'], ['output', 'Scheduled everywhere']]
      },
      {
        name: 'Lead scoring and routing', layout: 'chain',
        trigger: 'On form submitted',
        steps: [['trigger', 'Form submitted'], ['action', 'Enrich company data'], ['ai', 'Score fit and intent'],
                ['check', 'Above threshold?'], ['action', 'Route to an owner'], ['output', 'Start follow-up']]
      }
    ]
  },
  {
    id: 'cloud', name: 'Cloud & Infrastructure', angle: 180, icon: 'cloud',
    blurb: 'GPU AI compute, DevOps pipelines, zero-latency deployments, and security.',
    workflows: [
      {
        name: 'Scale under load', layout: 'loop',
        trigger: 'On latency threshold',
        steps: [['trigger', 'Latency climbs'], ['check', 'Policy allows scale'], ['action', 'Add a replica'], ['check', 'Recovered?']],
        back: 'Add another, up to the cap',
        tail: [['output', 'Notify, or roll back']]
      },
      {
        name: 'Continuous posture checks', layout: 'grid',
        trigger: 'Every hour',
        tasks: [['check', 'TLS expiry'], ['check', 'Open ports'], ['check', 'Image CVEs'],
                ['check', 'Backup freshness'], ['check', 'Secret age'], ['check', 'Disk headroom']],
        post: [['ai', 'Rank what matters'], ['output', 'One digest, not six alerts']]
      }
    ]
  },
  {
    id: 'education', name: 'Education Technology', angle: 225, icon: 'education',
    blurb: 'SWAN™ interactive smart boards, AI computer labs, and school ERP systems.',
    workflows: [
      {
        name: 'Attendance to guardian', layout: 'chain',
        trigger: 'On roll call',
        steps: [['trigger', 'Roll call closes'], ['check', 'Unexplained absence'], ['output', 'Guardian messaged']]
      },
      {
        name: 'Lesson to every SWAN board', layout: 'loop',
        trigger: 'On lesson published',
        steps: [['trigger', 'Teacher publishes'], ['action', 'Push to classroom boards'], ['check', 'Every board confirmed?']],
        back: 'Retry boards still offline',
        tail: [['output', 'Rollout report']]
      },
      {
        name: 'Assignment to feedback', layout: 'branch',
        trigger: 'On submission',
        pre: [['trigger', 'Student submits']],
        lanes: [
          [['action', 'Auto-grade objective parts']],
          [['ai', 'Draft written feedback']],
          [['check', 'Similarity check']]
        ],
        post: [['human', 'Teacher reviews'], ['output', 'Released to student']]
      }
    ]
  },
  {
    id: 'events', name: 'Events & Engagement', angle: 270, icon: 'events',
    blurb: 'Live event production, streaming infrastructure, ticketing, and artist booking.',
    workflows: [
      {
        name: 'Show night control room', layout: 'fanin',
        trigger: 'During the event',
        sources: [['trigger', 'Door scans'], ['trigger', 'Stream health'], ['trigger', 'Bar tills'], ['trigger', 'Crowd sentiment']],
        steps: [['ai', 'Spot the problem early'], ['output', 'Nudge the right crew']]
      },
      {
        name: 'Order to doors', layout: 'chain',
        trigger: 'On payment confirmed',
        steps: [['trigger', 'Order paid'], ['action', 'Issue ticket'], ['action', 'Remind 24h before'],
                ['check', 'Scanned at door'], ['output', 'Live capacity']]
      }
    ]
  },
  {
    id: 'data', name: 'Data & Transformation', angle: 315, icon: 'data',
    blurb: 'Data pipelines, financial analytics, reporting automation, and ETL systems.',
    workflows: [
      {
        name: 'Nightly pipeline', layout: 'fanin',
        trigger: 'Every night, 01:00',
        sources: [['trigger', 'CRM export'], ['trigger', 'Billing ledger'], ['trigger', 'Product events']],
        steps: [['check', 'Schema still valid'], ['action', 'Transform and join'], ['action', 'Load to warehouse'],
                ['check', 'Freshness within SLA'], ['output', 'Alert only on drift']]
      },
      {
        name: 'Month-end close', layout: 'branch',
        trigger: 'On period close',
        pre: [['trigger', 'Ledgers imported']],
        lanes: [
          [['action', 'Reconcile bank']],
          [['action', 'Reconcile payables']],
          [['ai', 'Flag anomalies']]
        ],
        post: [['human', 'Controller reviews'], ['output', 'Report issued']]
      }
    ]
  }
];
