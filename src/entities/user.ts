//Isso aqui vai ser pros testes de integração talvez...
//Trabalhar com mock é muito verboso, em pensar que eu basicamente estou pra começar
//A reescrever todos os serviços que fiz(não só do user) dá um cansaço kkk
//Talvez eu faça os unitários com ajuda do mock(acabo pegando bugs e resolvendo)
//E testes end-to-end talvez.

interface UserProps {
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
  is_active: boolean;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = {
      ...props,
      created_at: props.created_at ?? new Date(),
    };
  }

  public createUser({
    name,
    email,
    password,
    created_at,
    is_active,
  }: UserProps): User {
    return new User({ name, email, password, created_at, is_active });
  }
}
