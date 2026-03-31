import { useRoleStore, ROLES } from '../store/roleStore';
import { Icon } from './Icon';
import { TutorialButton } from './Tutorial';
import type { RoleId } from '../types';

interface HeaderProps {
  onToggleSimPanel: () => void;
  showSimPanel: boolean;
}

export const Header = ({ onToggleSimPanel, showSimPanel }: HeaderProps) => {
  const { currentRole, setRole, getRole } = useRoleStore();
  const role = getRole();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">G</span>
        </div>
        <span className="text-lg font-semibold text-gray-900">GlobGlob</span>
        <span className="text-xs text-gray-400 border-l border-gray-200 pl-3 ml-1">
          Workflow Platform
        </span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Help Button */}
        <TutorialButton />

        {/* Simulation Toggle */}
        <button
          onClick={onToggleSimPanel}
          className={`btn btn-sm ${showSimPanel ? 'btn-primary' : 'btn-secondary'} flex items-center gap-1.5`}
        >
          <Icon name="cog" size={14} />
          Simulation
        </button>

        {/* Role Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Role:</span>
          <div className="relative">
            <select
              value={currentRole}
              onChange={(e) => setRole(e.target.value as RoleId)}
              className="form-select pr-8 py-1.5 text-sm font-medium"
              style={{ borderColor: role.color }}
            >
              {Object.values(ROLES).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              style={{ backgroundColor: role.color }}
            />
          </div>
        </div>

        {/* User Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
          style={{ backgroundColor: role.color }}
          title={role.name}
        >
          {role.name.charAt(0)}
        </div>
      </div>
    </header>
  );
};
