import { useState } from 'react';
import cssLogo from 'simple-icons/icons/css.svg?raw';
import javaLogo from '../../assets/logos/java.svg?raw';
import {
  siArduino,
  siC,
  siCplusplus,
  siClickup,
  siExpress,
  siEspressif,
  siFastapi,
  siFigma,
  siGit,
  siGithubactions,
  siGodotengine,
  siGradle,
  siHtml5,
  siJavascript,
  siJira,
  siLatex,
  siLinux,
  siMongodb,
  siMysql,
  siNodedotjs,
  siNumpy,
  siPandas,
  siPhp,
  siPython,
  siPytest,
  siRaspberrypi,
  siReact,
  siReactrouter,
  siScikitlearn,
  siSpringboot,
  siTensorflow,
  siVite,
} from 'simple-icons';
import Icon from '../ui/Icon.jsx';

const logos = {
  arduino: siArduino,
  c: siC,
  cplusplus: siCplusplus,
  clickup: siClickup,
  express: siExpress,
  espressif: siEspressif,
  fastapi: siFastapi,
  figma: siFigma,
  git: siGit,
  githubactions: siGithubactions,
  godot: siGodotengine,
  gradle: siGradle,
  html5: siHtml5,
  javascript: siJavascript,
  jira: siJira,
  latex: siLatex,
  linux: siLinux,
  mongodb: siMongodb,
  mysql: siMysql,
  nodedotjs: siNodedotjs,
  numpy: siNumpy,
  pandas: siPandas,
  php: siPhp,
  python: siPython,
  pytest: siPytest,
  raspberrypi: siRaspberrypi,
  react: siReact,
  reactrouter: siReactrouter,
  scikitlearn: siScikitlearn,
  springboot: siSpringboot,
  tensorflow: siTensorflow,
  vite: siVite,
};

function SkillLogo({ icon, name }) {
  if (icon === 'css') {
    return (
      <span
        className="skills__logo skills__logo--asset"
        role="img"
        aria-label={`${name} logo`}
        dangerouslySetInnerHTML={{ __html: cssLogo }}
      />
    );
  }
  if (icon === 'java') {
    return (
      <span
        className="skills__logo skills__logo--asset skills__logo--java"
        role="img"
        aria-label={`${name} logo`}
        dangerouslySetInnerHTML={{ __html: javaLogo }}
      />
    );
  }
  const logo = logos[icon];
  if (logo) {
    return (
      <svg className={`skills__logo${icon === 'express' || icon === 'java' ? ' skills__logo--light' : ''}`} viewBox="0 0 24 24" role="img" aria-label={`${name} logo`}>
        <path d={logo.path} fill={icon === 'express' || icon === 'java' ? 'currentColor' : `#${logo.hex}`} />
      </svg>
    );
  }
  return (
    <span className="skills__logo skills__logo--technical" role="img" aria-label={`${name} technical icon`}>
      <Icon name={icon} size={22} />
    </span>
  );
}

// Skills use one stable panel so category changes do not move the surrounding page.
export default function SkillTable({ groups }) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.group ?? '');
  const active = groups.find((group) => group.group === activeGroup) ?? groups[0];
  return (
    <div className="skills" style={{ '--skills-item-count': active?.items.length ?? 0 }}>
      <nav className="skills__categories" aria-label="Skill categories">
        {groups.map((group) => (
          <button
            key={group.group}
            className={`skills__category${active?.group === group.group ? ' is-active' : ''}`}
            type="button"
            aria-pressed={active?.group === group.group}
            onClick={() => setActiveGroup(group.group)}
          >
            <span>{group.group}</span>
            <span className="skills__count">{group.items.length}</span>
          </button>
        ))}
      </nav>
      <div className="skills__content" aria-live="polite">
        <div className="skills__grid" key={active?.group}>
          {active?.items.map((item) => (
            <div className="skills__tile" key={item.name}>
              <span className="skills__icon">
                <SkillLogo icon={item.icon} name={item.name} />
              </span>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
