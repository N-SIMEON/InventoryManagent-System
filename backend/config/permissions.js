const permissions = {
  // Suppliers
  "supplier:create": ["owner", "manager"],
  "supplier:read":   ["owner", "manager", "staff", "viewer"],
  "supplier:update": ["owner", "manager"],
  "supplier:delete": ["owner", "manager"],

  // Purchase orders
  "po:create": ["owner", "manager"],
  "po:read":   ["owner", "manager", "staff", "viewer"],
  "po:update": ["owner", "manager"],
  "po:submit": ["owner", "manager"],
  "po:cancel": ["owner", "manager"],

  // Receiving and quality checks
  "po:receive": ["owner", "manager", "staff"],
  "qc:pass":    ["owner", "manager", "staff"],
  "qc:fail":    ["owner", "manager", "staff"],
};

module.exports = { permissions };