export const shellBrand = {
  name: 'Disciplined Expense',
  subtitle: 'Enterprise Admin',
  initials: 'DE',
}

export const shellProfile = {
  name: 'Elena Vance',
  role: 'Enterprise Admin',
  initials: 'EV',
}

export const primaryNav = [
  { label: 'Dashboard', href: '/admin/dashboard', section: 'dashboard' },
  { label: 'Employees', href: '/admin/employees', section: 'employees' },
  { label: 'Expenses', href: '/admin/expenses', section: 'expenses' },
  { label: 'Reports', href: '/admin/reports', section: 'reports' },
  { label: 'Payments', href: '/admin/payments', section: 'payments' },
  {
    label: 'Configuration',
    href: '/admin/approval-rules',
    section: 'configuration',
  },
]

export const topNav = [
  { label: 'Dashboard', href: '/admin/dashboard', section: 'dashboard' },
  { label: 'Expenses', href: '/admin/expenses', section: 'expenses' },
  { label: 'Reports', href: '/admin/reports', section: 'reports' },
  {
    label: 'Configuration',
    href: '/admin/approval-rules',
    section: 'configuration',
  },
]

export const configurationTabs = [
  { label: 'Approval Rules', href: '/admin/approval-rules' },
  { label: 'Category Management', href: '/admin/categories' },
  { label: 'CSV Import', href: '/admin/import' },
  { label: 'Hierarchy', href: '/admin/hierarchy' },
]

export const notifications = [
  { id: 1, title: '2 reimbursements are ready for payout', tone: 'brand' },
  { id: 2, title: 'CSV import blocked by 1 critical schema error', tone: 'amber' },
  {
    id: 3,
    title: 'Marcus Thorne updated executive approval flow',
    tone: 'aqua',
  },
]

export const dashboardData = {
  kpis: [
    {
      label: 'Total Spend',
      value: '$45,230',
      trend: '+4.2%',
      note: 'vs previous cycle',
      tone: 'aqua',
    },
    {
      label: 'Pending Approvals',
      value: '12',
      trend: 'Alert',
      note: '3 items nearing SLA',
      tone: 'amber',
    },
    {
      label: 'Reimbursed',
      value: '$12,400',
      trend: '65% Paid',
      note: 'settled this month',
      tone: 'aqua',
    },
    {
      label: 'Avg. Approval Time',
      value: '2.5 days',
      trend: 'Goal: 2d',
      note: 'slightly above benchmark',
      tone: 'neutral',
    },
  ],
  trend: [
    { month: 'Jan', previousHeight: 'h-10', currentHeight: 'h-16' },
    { month: 'Feb', previousHeight: 'h-16', currentHeight: 'h-24' },
    { month: 'Mar', previousHeight: 'h-20', currentHeight: 'h-28' },
    { month: 'Apr', previousHeight: 'h-24', currentHeight: 'h-32' },
    { month: 'May', previousHeight: 'h-28', currentHeight: 'h-36' },
    { month: 'Jun', previousHeight: 'h-24', currentHeight: 'h-32' },
    { month: 'Jul', previousHeight: 'h-36', currentHeight: 'h-44' },
  ],
  categoryBreakdown: [
    { label: 'Travel', share: '42%', dot: 'bg-brand-700' },
    { label: 'Software', share: '28%', dot: 'bg-aqua-600' },
    { label: 'Dining', share: '18%', dot: 'bg-amber-500' },
    { label: 'Office', share: '12%', dot: 'bg-ink-400' },
  ],
  departments: [
    { name: 'Engineering', amount: '$18,450', widthClass: 'w-[72%]' },
    { name: 'Marketing', amount: '$9,200', widthClass: 'w-[46%]' },
    { name: 'Sales', amount: '$12,100', widthClass: 'w-[58%]' },
    { name: 'Operations', amount: '$5,480', widthClass: 'w-[28%]' },
  ],
  activity: [
    {
      actor: 'Sarah Jenkins',
      action: 'submitted',
      subject: 'Flight to London (Client Visit)',
      amount: '$1,250.00',
      toneClass: 'bg-brand-100 text-brand-950',
      time: '2m ago',
    },
    {
      actor: 'Manager',
      action: 'approved',
      subject: 'Quarterly SaaS subscriptions',
      amount: '$4,890.00',
      toneClass: 'bg-aqua-100 text-aqua-700',
      time: '1h ago',
    },
    {
      actor: 'Robert Fox',
      action: 'submitted',
      subject: 'Dinner with AWS team',
      amount: '$125.40',
      toneClass: 'bg-brand-100 text-brand-950',
      time: '5h ago',
    },
  ],
}

export const employeeManagementData = {
  summary: [
    {
      label: 'Total Staff',
      value: '1,284',
      note: '12% from last month',
      tone: 'aqua',
    },
    {
      label: 'Departments',
      value: '14',
      note: 'Global HQ operations',
      tone: 'brand',
    },
    {
      label: 'Pending Syncs',
      value: '03',
      note: 'Action required in HRMS',
      tone: 'amber',
    },
  ],
  roleMix: [
    { label: 'Admin', shareClass: 'w-[22%]', dot: 'bg-brand-700' },
    { label: 'Manager', shareClass: 'w-[28%]', dot: 'bg-aqua-600' },
    { label: 'User', shareClass: 'w-[50%]', dot: 'bg-ink-400' },
  ],
  rows: [
    {
      name: 'Julianne Smith',
      email: 'julianne.s@enterprise.com',
      employeeId: 'EMP-90210',
      department: 'Engineering',
      role: 'Admin',
      reportsTo: 'Marcus Aurelius',
      initials: 'JS',
    },
    {
      name: 'Robert King',
      email: 'r.king@enterprise.com',
      employeeId: 'EMP-88421',
      department: 'Marketing',
      role: 'Manager',
      reportsTo: 'Sarah Chen',
      initials: 'RK',
    },
    {
      name: 'Aisha Mohammed',
      email: 'a.mohammed@enterprise.com',
      employeeId: 'EMP-77102',
      department: 'Finance',
      role: 'User',
      reportsTo: 'Julianne Smith',
      initials: 'AM',
    },
    {
      name: 'Tom Lee',
      email: 't.lee@enterprise.com',
      employeeId: 'EMP-66504',
      department: 'Operations',
      role: 'User',
      reportsTo: 'Julianne Smith',
      initials: 'TL',
    },
  ],
}

export const expenseRows = [
  {
    date: 'Oct 24, 2023',
    employee: 'Arthur Morgan',
    initials: 'AM',
    category: 'Travel',
    description: 'Flight to Valentine Conference',
    amount: '$1,240.50',
    status: 'Paid',
  },
  {
    date: 'Oct 26, 2023',
    employee: 'Jane Doe',
    initials: 'JD',
    category: 'Meals',
    description: 'Client dinner - Blackwood Estate',
    amount: '$345.00',
    status: 'Submitted',
  },
  {
    date: 'Oct 27, 2023',
    employee: 'Marc Spector',
    initials: 'MS',
    category: 'Hardware',
    description: 'New monitor - Dell UltraSharp',
    amount: '$899.00',
    status: 'Approved',
  },
  {
    date: 'Oct 28, 2023',
    employee: 'Jane Doe',
    initials: 'JD',
    category: 'Entertainment',
    description: 'Spotify annual subscription',
    amount: '$15.99',
    status: 'Refused',
  },
  {
    date: 'Oct 30, 2023',
    employee: 'Arthur Morgan',
    initials: 'AM',
    category: 'Fuel',
    description: 'Regional site visit transport',
    amount: '$82.20',
    status: 'Submitted',
  },
]

export const expensesData = {
  statusFilters: [
    { label: 'Draft', checked: false },
    { label: 'Submitted', checked: true },
    { label: 'Approved', checked: false },
    { label: 'Paid', checked: false },
    { label: 'Refused', checked: false },
  ],
  employees: [
    { label: 'Jane Doe', initials: 'JD', count: 12 },
    { label: 'Marc Spector', initials: 'MS', count: 8 },
    { label: 'Arthur Morgan', initials: 'AM', count: 24, active: true },
    { label: 'Sarah Bloom', initials: 'SB', count: 9 },
  ],
  categories: ['Travel', 'Office Supplies', 'Meals', 'Software'],
  rows: expenseRows,
  highlights: [
    {
      label: 'Total Pending',
      value: '$4,821.50',
      note: '12% from last week',
      tone: 'danger',
    },
    {
      label: 'Top Category',
      value: 'Travel',
      note: '32% of total spend',
      tone: 'brand',
    },
    {
      label: 'Employee Insights',
      value: 'Arthur Morgan has submitted 4 high-value travel claims this month.',
      note: 'Flag for review?',
      tone: 'soft',
    },
  ],
}

export const reportsData = {
  statusFilters: [
    { label: 'All Reports', checked: true },
    { label: 'Draft', checked: false },
    { label: 'Submitted', checked: false },
    { label: 'Approved', checked: false },
  ],
  employees: [
    { label: 'Me', initials: 'ME' },
    { label: 'My Team', initials: 'MT' },
    { label: 'Everyone', initials: 'EV', active: true },
  ],
  totals: [
    { label: 'To Submit', value: '$1,240.50', reports: '8 reports', tone: 'brand' },
    {
      label: 'Under Validation',
      value: '$4,812.20',
      reports: '14 reports',
      tone: 'aqua',
    },
    {
      label: 'To Be Reimbursed',
      value: '$9,530.00',
      reports: '21 reports',
      tone: 'amber',
    },
  ],
  monthGroups: [
    {
      month: 'October 2023',
      count: '4 reports',
      open: true,
      rows: [
        {
          report: 'Q4 Marketing Offsite - Austin',
          employee: 'Sarah Jenkins',
          initials: 'SJ',
          dateRange: 'Oct 12 - Oct 15',
          total: '$2,450.00',
          status: 'Submitted',
        },
        {
          report: 'Monthly Travel - Regional Sales',
          employee: 'Michael Chen',
          initials: 'MC',
          dateRange: 'Oct 01 - Oct 31',
          total: '$842.20',
          status: 'Draft',
        },
        {
          report: 'Client Dinner - Venture Partners',
          employee: 'David Miller',
          initials: 'DM',
          dateRange: 'Oct 18',
          total: '$312.50',
          status: 'Approved',
        },
      ],
    },
    { month: 'September 2023', count: '12 reports', open: false, rows: [] },
    { month: 'August 2023', count: '18 reports', open: false, rows: [] },
  ],
}

export const hierarchyData = {
  departments: [
    { label: 'Executive', count: 12, checked: true },
    { label: 'Finance', count: 45, checked: true },
    { label: 'Operations', count: 128, checked: false },
    { label: 'Technology', count: 210, checked: true },
  ],
  levels: ['C-Suite', 'Directors', 'Managers', 'Staff'],
  tree: {
    leader: {
      name: 'Marcus Thorne',
      title: 'Chief Executive Officer',
      badge: 'Executive',
      initials: 'MT',
    },
    branches: [
      {
        name: 'Elena Rodriguez',
        title: 'Chief Financial Officer',
        badge: 'Finance',
        initials: 'ER',
        children: [
          {
            name: 'James Wilson',
            title: 'Controller',
            badge: 'Finance',
            initials: 'JW',
          },
        ],
      },
      {
        name: 'David Chen',
        title: 'Chief Operating Officer',
        badge: 'Operations',
        initials: 'DC',
        children: [
          {
            name: 'Sarah Jenkins',
            title: 'Head of HR',
            badge: 'Operations',
            initials: 'SJ',
          },
        ],
      },
      {
        name: 'Michael Shaw',
        title: 'Chief Technology Officer',
        badge: 'Technology',
        initials: 'MS',
        children: [
          {
            name: 'Priya Sharma',
            title: 'Engineering VP',
            badge: 'Technology',
            initials: 'PS',
          },
        ],
      },
    ],
  },
}

export const paymentsData = {
  stats: [
    {
      label: 'Pending Settlement',
      value: 'Rs 4,28,400.00',
      note: '12% from last week',
      tone: 'aqua',
    },
    {
      label: 'Queue Volume',
      value: '184 Items',
      note: 'awaiting approval sequence',
      tone: 'neutral',
    },
    {
      label: 'Connected Wallet',
      value: 'Razorpay X',
      note: 'ending in .... 8829',
      tone: 'brand',
    },
  ],
  tabs: ['All', 'Unpaid', 'Processing'],
  rows: [
    {
      employee: 'Marcus Thorne',
      initials: 'MT',
      department: 'Marketing Lead',
      category: 'Digital Advertising',
      submitted: 'Oct 12, 2023',
      amount: 'Rs 2,450.00',
      status: 'Pending Payment',
      action: 'Trigger',
    },
    {
      employee: 'Sarah Chen',
      initials: 'SC',
      department: 'Systems Architect',
      category: 'Cloud Infrastructure',
      submitted: 'Oct 14, 2023',
      amount: 'Rs 84,200.00',
      status: 'Processing',
      action: 'Locked',
    },
    {
      employee: 'Julian Drax',
      initials: 'JD',
      department: 'Sales Ops',
      category: 'Client Travel',
      submitted: 'Oct 09, 2023',
      amount: 'Rs 4,120.00',
      status: 'Live Integration',
      action: 'Webhook',
    },
    {
      employee: 'David Kim',
      initials: 'DK',
      department: 'Product Design',
      category: 'Software License',
      submitted: 'Oct 15, 2023',
      amount: 'Rs 1,15,000.00',
      status: 'Pending Payment',
      action: 'Trigger',
    },
  ],
}

export const categoriesData = {
  summaryCount: 24,
  usage: [
    { label: 'Travel', share: '44%', widthClass: 'w-[88%]', toneClass: 'bg-aqua-500' },
    { label: 'Meals', share: '24%', widthClass: 'w-[48%]', toneClass: 'bg-brand-500' },
    {
      label: 'Software',
      share: '18%',
      widthClass: 'w-[36%]',
      toneClass: 'bg-amber-500',
    },
    {
      label: 'Office Supplies',
      share: '14%',
      widthClass: 'w-[28%]',
      toneClass: 'bg-ink-400',
    },
  ],
  categories: [
    {
      name: 'Travel',
      code: 'TRV-001',
      label: 'Flights and stays',
      status: 'Active',
    },
    {
      name: 'Meals',
      code: 'MLS-009',
      label: 'Client hospitality',
      status: 'Active',
    },
    {
      name: 'Software',
      code: 'SFT-122',
      label: 'Tools and licenses',
      status: 'Active',
    },
    {
      name: 'Office Supplies',
      code: 'OPS-018',
      label: 'Stationery and hardware',
      status: 'Review',
    },
  ],
}

export const approvalRulesData = {
  rules: [
    {
      name: 'Executive Travel',
      description: 'Multi-level approval for C-suite expenses over $5k.',
      active: true,
      version: 'v2.4',
    },
    {
      name: 'Standard Office Supplies',
      description: 'Auto-approve items under $50 per month.',
      active: false,
      version: 'v1.8',
    },
    {
      name: 'Marketing Events',
      description: 'Requires department head and finance lead sign-off.',
      active: false,
      version: 'v3.0',
    },
    {
      name: 'IT Infrastructure',
      description: 'Rigorous 4-step check for hardware procurement.',
      active: false,
      version: 'v1.2',
    },
  ],
  controls: [
    { label: 'VIP Exclusive Rule', enabled: true },
    { label: 'Require Receipt Scan', enabled: true },
    { label: 'Notify Submitter', enabled: false },
  ],
  threshold: '15%',
  steps: [
    {
      order: 1,
      title: 'Line Manager Verification',
      description: 'Immediate supervisor review',
      approvers: ['Sarah Jenkins', 'Marcus Thorne'],
      required: false,
    },
    {
      order: 2,
      title: 'Department Head',
      description: 'Strategic budget alignment',
      approvers: ['Head of HR'],
      required: true,
    },
    {
      order: 3,
      title: 'Finance & Treasury',
      description: 'Final disbursement check',
      approvers: ['David Miller'],
      required: false,
    },
  ],
  metrics: [
    { label: 'Active Users', value: '42', note: '+3 this month' },
    { label: 'Avg Time', value: '1.4d', note: 'Exceeds SLA' },
    { label: 'Rejections', value: '8%', note: 'Policy alignment high' },
    { label: 'Last Modified', value: 'Oct 24, 2023', note: 'by Admin_Global' },
  ],
}

export const csvImportData = {
  manifest: 'Q4_Expenditure.csv',
  totalRows: '1,428',
  readyRows: '1,427',
  criticalError: 'Missing value in "Date" column on row 3.',
  mappings: [
    { field: 'Expense Date', mappedTo: 'date_posted', status: 'pending' },
    { field: 'Total Amount', mappedTo: 'amount_val', status: 'mapped' },
    { field: 'Merchant', mappedTo: 'vendor_name', status: 'pending' },
  ],
  previewRows: [
    {
      date: '2023-10-12',
      merchant: 'Cloud Services Inc.',
      amount: '$1,240.00',
      status: 'Valid',
    },
    {
      date: '2023-10-13',
      merchant: 'Office Supplies Co.',
      amount: '$45.12',
      status: 'Valid',
    },
    {
      date: 'Missing',
      merchant: 'Transit Auth',
      amount: '$12.00',
      status: 'Error',
    },
  ],
  tips: [
    'System automatically detects date formats. If yours is not listed, use advanced formatting tools.',
    'Last import was 2 days ago. Use duplicate check to avoid redundant entries.',
  ],
}
