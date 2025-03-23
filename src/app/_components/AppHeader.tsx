import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useI18nStore } from '~/i18n/store';
import { useTranslation, languages } from '~/i18n/useTranslation';

const LanguageSelector = () => {
  const { lang, setLang } = useI18nStore();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          {languages.find(l => l.code === lang)?.name ?? lang}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(({ code, name }) => (
          <DropdownMenuItem key={code} onClick={() => setLang(code)}>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export function AppHeader() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row items-center px-4 w-full">
      <a
        className="font-serif text-lg font-extralight text-gray-500"
        href="https://github.com/langmanus/langmanus"
        target="_blank"
      >
        {t('appTitle')}
      </a>
      <div className="ml-auto">
        <LanguageSelector />
      </div>
    </div>
  );
}
