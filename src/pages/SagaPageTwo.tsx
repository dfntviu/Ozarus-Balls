    //  libreria de react
import { useEffect } from 'react';
import { Link,useLocation, useParams, useSearchParams } from 'react-router';
import { ROLES, type Role } from '../types/character';   // libreria de Interface
import { findSaga } from "../data/sagas";  // banco de datos
import { byPower, bySaga, byRole, countBy, featured} from '../data/characters'; //nuevas f(n)s para filtrar
import { CharacterGrid } from "../components/character/CharacterGrid";  
import { FilterChips } from "../components/filters/FilterChips";
import { NotFoundPage } from "../pages/NotFoundPage";  //navegacion erronea
 import  styles from './SagaPage.module.css';

 const ROLE_PLURAL : Record<Role, string> = { hero:'Heroes' , villain: 'Villanos', support: 'Apoyo'};

  export function SagaPagePhaseFour(){
    const {sagaId} = useParams();
    const [params] = useSearchParams()
    const {hash} = useLocation();
    const saga = findSaga(sagaId);

     useEffect( ()=> {
         if (hash)  document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({block: 'start'});
     }, [hash]);

     if (!saga || !saga.enabled) return <NotFoundPage/>

    //  Derivados baratos (60 elementos): son reacalculado en cada render sin useMemo
    const all = bySaga(saga.id).sort(byPower);
    const roleParam =  params.get('rol');
    const role   =   ROLES.find((r)=> r === roleParam);   
    const arc = params.get('arco');
    const arcs = [...new Set(all.map((c)=> c.arc).filter((a): a is string => !!a))]
    const visible = all.filter((c)=> (!role || c.role === role)&& (!arc || c.arc === arc))
    const roleCounts = countBy(all, (c) => c.role );
    const arcCounts = countBy(all, (c) => c.arc );
    const {warriors, deities, angels } = featured(saga.id);

    const feauturedGroups = [
        {tittle: 'Guerreros', list: warriors},
        {tittle: 'Deidades', list: deities},
        {tittle: 'Angels', list: angels}
    ].filter((g)=> g.list.length);


    return(
        <article className={saga.id}>
            <header className={styles.band}>
                <p className={styles.kicker}>
                    <h1 className={styles.title}></h1>
                        <p className={styles.tagline}></p>
                        <dl>
                            <div><dt>Personajes</dt> {all.length} </div>
                            <div><dt>Heroés</dt> {byRole('hero', all).length} </div>
                            <div><dt>Villanos</dt>{byRole('villain', all).length} </div>
                        </dl>
                </p>
            </header>

            <section className={styles.featured}>
                <h2 className={styles.sectionTitle}></h2>
                <div className={styles.featuredGroup}>
                    { feauturedGroups.map( (g) => (
                        <div>
                            <h3 className={styles.groupTitle}> {g.tittle} </h3>
                            <ul className={styles.chips}>
                                {g.list.map((c) => (
                                    <li    >
                                        <Link to={{search: '', hash: c.id}} className={styles.chip}>
                                            {c.name}
                                            {c.transformations?.[0] && <span className={styles.form}>{c.transformations[0]} </span>}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        ))}
                </div>
            </section>

            <section aria-labelledby='todos' className={styles.listing}>
                <div className={styles.listeningHead}>
                    <h2 id='todos' className={styles.sectionTitle}>Personajes</h2>
                        <p className= {styles.counter} aria-live="polite">Mostrando  {visible.length} de {all.length} </p>
                </div>

                <div className={styles.filters}>
                    <FilterChips label='Rol' param='rol' total={all.length}  options={ROLES.map((r) => ({ value: r, label: ROLE_PLURAL[r], count: roleCounts[r] ?? 0 }))} />
                    { arcs.length > 0 && (
                        <FilterChips label='Arco' param='arco' total={all.length} options={ROLES.map((a) => ({ value: a, label: ROLE_PLURAL[a], count: arcCounts[a] ?? 0 }))}/>
                    )}
                </div>
                <CharacterGrid characters={visible}/>
            </section>
        </article>
    );
}

