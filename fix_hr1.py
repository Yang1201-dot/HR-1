
#!/usr/bin/env python3

import re

with open('modules/dashboard.html', 'r', encoding='utf-8') as f:

    content = f.read()

# Find and replace the HR1 section

old_pattern = r'<!-- HR1 Submenu -->.*?</div>\s*<!-- Other HR Items -->'

new_section = '''<!-- HR1 Collapsible Submenu -->

            <div class="nav-item-group">

              <button class="submenu-item has-submenu" data-module="hr1">

                <div class="nav-item-content">

                  <i data-lucide="folder"></i>

                  <span>HR 1</span>

                </div>

                <i data-lucide="chevron-down" class="submenu-icon"></i>

              </button>

              <div class="submenu nested-submenu" id="submenu-hr1">

                <a href="#" class="submenu-item" data-page="recruitment">

                  <i data-lucide="briefcase"></i>

                  <span>Recruitment</span>

                </a>

                <a href="#" class="submenu-item" data-page="app-mgmt">

                  <i data-lucide="file-text"></i>

                  <span>Application Management</span>

                </a>

                <a href="#" class="submenu-item" data-page="onboard">

                  <i data-lucide="user-check"></i>

                  <span>Onboarding</span>

                </a>

                <a href="#" class="submenu-item" data-page="evaluation">

                  <i data-lucide="trending-up"></i>

                  <span>Performance Evaluation</span>

                </a>

                <a href="#" class="submenu-item" data-page="social-rec">

                  <i data-lucide="award"></i>

                  <span>Social Recognition</span>

                </a>

              </div>

            </div>

            <!-- Other HR Items -->'''

content = re.sub(old_pattern, new_section, content, flags=re.DOTALL)

with open('modules/dashboard.html', 'w', encoding='utf-8') as f:

    f.write(content)

print("✓ Fixed HR1 collapsible section")

